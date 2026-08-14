import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../environment/models/environment.model';
import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG } from './models/session.model';
import { resetSessionInterceptorStateForTesting, sessionInterceptor } from './session.interceptor';
import { SessionService } from './session.service';

describe('sessionInterceptor', () => {
    const sessionService = {
        clear: jest.fn(),
        getRefreshToken: jest.fn(),
        getToken: jest.fn(),
        setRefreshToken: jest.fn(),
        setToken: jest.fn()
    };

    const router = {
        navigate: jest.fn()
    };

    const httpClient = {
        post: jest.fn()
    };

    const environmentConfig: EnvironmentConfig = {
        accessControlUrl: 'https://api.test',
        appName: 'test-app',
        cookieName: 'test-session',
        webApiPath: '/api',
        baseUrl: 'https://api.test'
    };

    let next: HttpHandlerFn;

    beforeEach(() => {
        jest.resetAllMocks();
        resetSessionInterceptorStateForTesting();
        sessionService.getToken.mockReturnValue(null);
        sessionService.getRefreshToken.mockReturnValue(null);

        TestBed.configureTestingModule({
            providers: [
                { provide: SessionService, useValue: sessionService },
                { provide: Router, useValue: router },
                { provide: HttpClient, useValue: httpClient },
                { provide: ENVIRONMENT_CONFIG, useValue: environmentConfig },
                { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG }
            ]
        });
    });

    function runInterceptor(request: HttpRequest<unknown>, handler: HttpHandlerFn) {
        return TestBed.runInInjectionContext(() => sessionInterceptor(request, handler));
    }

    describe('authorization header', () => {
        it('should add Authorization header when token exists', done => {
            sessionService.getToken.mockReturnValue('my-jwt');
            next = jest.fn(request => {
                expect(request.headers.get('Authorization')).toBe('Bearer my-jwt');

                return of(new HttpResponse({ status: 200 }));
            });

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe(() => {
                expect(next).toHaveBeenCalled();
                done();
            });
        });

        it('should not add Authorization header when no token', done => {
            sessionService.getToken.mockReturnValue(null);
            next = jest.fn(request => {
                expect(request.headers.has('Authorization')).toBe(false);

                return of(new HttpResponse({ status: 200 }));
            });

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe(() => {
                expect(next).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should not touch the session on non-401 errors', () => {
        sessionService.getToken.mockReturnValue('valid-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500 })));

        const request = new HttpRequest('GET', '/api/data');

        runInterceptor(request, next).subscribe({
            error: () => {
                expect(sessionService.clear).not.toHaveBeenCalled();
                expect(router.navigate).not.toHaveBeenCalled();
                expect(httpClient.post).not.toHaveBeenCalled();
            }
        });
    });

    describe('401 without a refresh token', () => {
        it('clears the session and redirects to login immediately', done => {
            sessionService.getToken.mockReturnValue('expired-token');
            sessionService.getRefreshToken.mockReturnValue(null);
            next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe({
                error: (error: HttpErrorResponse) => {
                    expect(sessionService.clear).toHaveBeenCalled();
                    expect(router.navigate).toHaveBeenCalledWith(['/login']);
                    expect(httpClient.post).not.toHaveBeenCalled();
                    expect(error.status).toBe(401);
                    done();
                }
            });
        });

        it('uses the configured loginRoute', done => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    { provide: SessionService, useValue: sessionService },
                    { provide: Router, useValue: router },
                    { provide: HttpClient, useValue: httpClient },
                    { provide: ENVIRONMENT_CONFIG, useValue: environmentConfig },
                    { provide: SESSION_CONFIG, useValue: { ...DEFAULT_SESSION_CONFIG, loginRoute: '/auth/signin' } }
                ]
            });

            sessionService.getToken.mockReturnValue('expired-token');
            sessionService.getRefreshToken.mockReturnValue(null);
            next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe({
                error: () => {
                    expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
                    done();
                }
            });
        });
    });

    describe('401 with a refresh token', () => {
        it('refreshes the token and retries the original request with it', done => {
            sessionService.getToken.mockReturnValue('expired-token');
            sessionService.getRefreshToken.mockReturnValue('my-refresh-token');
            httpClient.post.mockReturnValue(of({ accessToken: 'new-token', refreshToken: 'new-refresh-token' }));

            let attempt = 0;
            next = jest.fn(request => {
                attempt++;

                if (attempt === 1) {
                    expect(request.headers.get('Authorization')).toBe('Bearer expired-token');

                    return throwError(() => new HttpErrorResponse({ status: 401 }));
                }

                expect(request.headers.get('Authorization')).toBe('Bearer new-token');

                return of(new HttpResponse({ status: 200 }));
            });

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe(() => {
                expect(httpClient.post).toHaveBeenCalledWith(`${environmentConfig.accessControlUrl}/refresh`, {
                    refreshToken: 'my-refresh-token'
                });
                expect(sessionService.setToken).toHaveBeenCalledWith('new-token');
                expect(sessionService.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');
                expect(sessionService.clear).not.toHaveBeenCalled();
                expect(attempt).toBe(2);
                done();
            });
        });

        it('clears the session and redirects to login when the refresh request itself fails', done => {
            sessionService.getToken.mockReturnValue('expired-token');
            sessionService.getRefreshToken.mockReturnValue('my-refresh-token');
            httpClient.post.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
            next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

            const request = new HttpRequest('GET', '/api/data');

            runInterceptor(request, next).subscribe({
                error: () => {
                    expect(sessionService.clear).toHaveBeenCalled();
                    expect(router.navigate).toHaveBeenCalledWith(['/login']);
                    done();
                }
            });
        });

        it('shares a single in-flight refresh across concurrent 401s instead of issuing one per request', () => {
            sessionService.getToken.mockReturnValue('expired-token');
            sessionService.getRefreshToken.mockReturnValue('my-refresh-token');

            const refreshResult$ = new Subject<{ accessToken: string; refreshToken: string }>();
            httpClient.post.mockReturnValue(refreshResult$);

            const makeNext = () =>
                jest.fn((request: HttpRequest<unknown>) =>
                    request.headers.get('Authorization') === 'Bearer expired-token'
                        ? throwError(() => new HttpErrorResponse({ status: 401 }))
                        : of(new HttpResponse({ status: 200 }))
                );

            const nextA = makeNext();
            const nextB = makeNext();
            const resultA = jest.fn();
            const resultB = jest.fn();

            runInterceptor(new HttpRequest('GET', '/api/a'), nextA).subscribe(resultA);
            runInterceptor(new HttpRequest('GET', '/api/b'), nextB).subscribe(resultB);

            expect(httpClient.post).toHaveBeenCalledTimes(1);

            refreshResult$.next({ accessToken: 'new-token', refreshToken: 'new-refresh-token' });
            refreshResult$.complete();

            expect(resultA).toHaveBeenCalled();
            expect(resultB).toHaveBeenCalled();
            expect(nextA).toHaveBeenCalledTimes(2);
            expect(nextB).toHaveBeenCalledTimes(2);
        });
    });

    it('propagates a 401 from the refresh request itself without attempting to refresh again', done => {
        sessionService.getToken.mockReturnValue('some-token');
        sessionService.getRefreshToken.mockReturnValue('my-refresh-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

        const request = new HttpRequest('GET', `${environmentConfig.accessControlUrl}/refresh`);

        runInterceptor(request, next).subscribe({
            error: (error: HttpErrorResponse) => {
                expect(error.status).toBe(401);
                expect(httpClient.post).not.toHaveBeenCalled();
                expect(sessionService.clear).not.toHaveBeenCalled();
                done();
            }
        });
    });
});
