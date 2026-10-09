import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TestingConfig } from '@testing/models/testing.model';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionService } from './session.service';

const ACCESS_CONTROL_URL = 'https://api.test/auth';
const REFRESH_URL = `${ACCESS_CONTROL_URL}/refresh`;
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('sessionInterceptor', () => {
    let httpClient: HttpClient;
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;
    let session: SessionService;

    function configure(config: TestingConfig = {}): void {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting(config)] });

        httpClient = TestBed.inject(HttpClient);
        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        session = TestBed.inject(SessionService);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('authorization header', () => {
        it('adds the Authorization header when there is a token', () => {
            configure({ token: 'my-jwt' });

            httpClient.get('/api/data').subscribe();
            const request = httpTesting.expectOne('/api/data');

            expect(request.request.headers.get('Authorization')).toBe('Bearer my-jwt');
            request.flush({});
        });

        it('does not add the Authorization header when there is no token', () => {
            configure();

            httpClient.get('/api/data').subscribe();
            const request = httpTesting.expectOne('/api/data');

            expect(request.request.headers.has('Authorization')).toBe(false);
            request.flush({});
        });
    });

    it('leaves the session alone on errors other than 401', () => {
        configure({ token: 'valid-token' });
        const error = jest.fn();

        httpClient.get('/api/data').subscribe({ error });
        httpTesting.expectOne('/api/data').flush(null, { status: 500, statusText: 'Server Error' });

        expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
        expect(session.getToken()).toBe('valid-token');
        expect(navigate).not.toHaveBeenCalled();
        httpTesting.expectNone(REFRESH_URL);
    });

    describe('401 on a request', () => {
        it('refreshes through the cookie and retries the request with the new token', () => {
            configure({ token: 'expired-token' });
            const received = jest.fn();

            httpClient.get('/api/data').subscribe(received);
            const firstAttempt = httpTesting.expectOne('/api/data');
            expect(firstAttempt.request.headers.get('Authorization')).toBe('Bearer expired-token');
            firstAttempt.flush(null, UNAUTHORIZED);

            const refresh = httpTesting.expectOne({ method: 'POST', url: REFRESH_URL });
            expect(refresh.request.withCredentials).toBe(true);
            expect(refresh.request.body).toBeNull();
            refresh.flush({ accessToken: 'new-token' });

            const retry = httpTesting.expectOne('/api/data');
            expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
            retry.flush({ id: 1 });

            expect(received).toHaveBeenCalledWith({ id: 1 });
            expect(session.getToken()).toBe('new-token');
            expect(navigate).not.toHaveBeenCalled();
        });

        it('shares a single in-flight refresh across concurrent 401s instead of issuing one per request', () => {
            configure({ token: 'expired-token' });
            const resultA = jest.fn();
            const resultB = jest.fn();

            httpClient.get('/api/a').subscribe(resultA);
            httpClient.get('/api/b').subscribe(resultB);
            httpTesting.expectOne('/api/a').flush(null, UNAUTHORIZED);
            httpTesting.expectOne('/api/b').flush(null, UNAUTHORIZED);

            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: 'new-token' });
            httpTesting.expectOne('/api/a').flush('a');
            httpTesting.expectOne('/api/b').flush('b');

            expect(resultA).toHaveBeenCalledWith('a');
            expect(resultB).toHaveBeenCalledWith('b');
        });

        it('clears the session and goes to the login route when the refresh fails', () => {
            configure({ token: 'expired-token' });
            const error = jest.fn();

            httpClient.get('/api/data').subscribe({ error });
            httpTesting.expectOne('/api/data').flush(null, UNAUTHORIZED);
            httpTesting.expectOne(REFRESH_URL).flush(null, UNAUTHORIZED);

            expect(error).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
            expect(error).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/data' }));
            expect(session.isAuthenticated()).toBe(false);
            expect(navigate).toHaveBeenCalledWith(['/login']);
        });

        it('uses the configured loginRoute', () => {
            configure({ session: { loginRoute: '/auth/signin' }, token: 'expired-token' });

            httpClient.get('/api/data').subscribe({ error: jest.fn() });
            httpTesting.expectOne('/api/data').flush(null, UNAUTHORIZED);
            httpTesting.expectOne(REFRESH_URL).flush(null, UNAUTHORIZED);

            expect(navigate).toHaveBeenCalledWith(['/auth/signin']);
        });
    });

    it.each(['login', 'logout', 'refresh', 'register'])(
        'hands a 401 from %s to the caller without refreshing nor leaving the page',
        endpoint => {
            configure({ token: 'some-token' });
            const error = jest.fn();

            httpClient.post(`${ACCESS_CONTROL_URL}/${endpoint}`, {}).subscribe({ error });
            httpTesting.expectOne(`${ACCESS_CONTROL_URL}/${endpoint}`).flush(null, UNAUTHORIZED);

            expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
            expect(session.getToken()).toBe('some-token');
            expect(navigate).not.toHaveBeenCalled();
            httpTesting.expectNone(REFRESH_URL);
        }
    );
});
