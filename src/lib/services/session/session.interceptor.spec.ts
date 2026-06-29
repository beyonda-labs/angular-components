import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG } from './models/session.model';
import { sessionInterceptor } from './session.interceptor';
import { SessionService } from './session.service';

describe('sessionInterceptor', () => {
    const sessionService = {
        clear: jest.fn(),
        getToken: jest.fn()
    };

    const router = {
        navigate: jest.fn()
    };

    let next: HttpHandlerFn;

    beforeEach(() => {
        jest.resetAllMocks();
        sessionService.getToken.mockReturnValue(null);

        TestBed.configureTestingModule({
            providers: [
                { provide: SessionService, useValue: sessionService },
                { provide: Router, useValue: router },
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

    it('should clear session and redirect to login on 401', () => {
        sessionService.getToken.mockReturnValue('expired-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

        const request = new HttpRequest('GET', '/api/data');

        runInterceptor(request, next).subscribe({
            error: () => {
                expect(sessionService.clear).toHaveBeenCalled();
                expect(router.navigate).toHaveBeenCalledWith(['/login']);
            }
        });
    });

    it('should re-throw the error after clearing session', done => {
        sessionService.getToken.mockReturnValue('expired-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

        const request = new HttpRequest('GET', '/api/data');

        runInterceptor(request, next).subscribe({
            error: (error: HttpErrorResponse) => {
                expect(error.status).toBe(401);
                done();
            }
        });
    });

    it('should not clear session on non-401 errors', () => {
        sessionService.getToken.mockReturnValue('valid-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 500 })));

        const request = new HttpRequest('GET', '/api/data');

        runInterceptor(request, next).subscribe({
            error: () => {
                expect(sessionService.clear).not.toHaveBeenCalled();
                expect(router.navigate).not.toHaveBeenCalled();
            }
        });
    });

    it('should use custom loginRoute from config', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                { provide: SessionService, useValue: sessionService },
                { provide: Router, useValue: router },
                {
                    provide: SESSION_CONFIG,
                    useValue: { ...DEFAULT_SESSION_CONFIG, loginRoute: '/auth/signin' }
                }
            ]
        });

        sessionService.getToken.mockReturnValue('expired-token');
        next = jest.fn(() => throwError(() => new HttpErrorResponse({ status: 401 })));

        const request = new HttpRequest('GET', '/api/data');

        runInterceptor(request, next).subscribe({
            error: () => {
                expect(router.navigate).toHaveBeenCalledWith(['/auth/signin']);
            }
        });
    });
});
