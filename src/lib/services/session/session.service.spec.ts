import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeStorageService } from '@testing/services/fake-storage.service';

import { SessionUser } from './models/session.model';
import { SessionService } from './session.service';

const LOGOUT_URL = 'https://api.test/auth/logout';
const REFRESH_URL = 'https://api.test/auth/refresh';
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

describe('SessionService', () => {
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;
    let service: SessionService;
    let storage: FakeStorageService;

    const mockUser: SessionUser = {
        allowedPaths: ['/dashboard', '/settings'],
        email: 'john@example.com',
        name: 'John',
        redirectPath: '/dashboard',
        roles: ['admin'],
        surname: 'Doe'
    };

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    function restored(): boolean[] {
        const answers: boolean[] = [];

        service.restore().subscribe(answer => answers.push(answer));

        return answers;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        service = TestBed.inject(SessionService);
        storage = TestBed.inject(FakeStorageService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('starts signed out, with no token and no user', () => {
        expect(service.isAuthenticated()).toBe(false);
        expect(service.token()).toBeNull();
        expect(service.user()).toBeNull();
    });

    describe('storage', () => {
        it('removes the session keys an older version left in storage when it is created', () => {
            storage.set('bey_token', 'stored-token');
            storage.set('bey_refresh_token', 'stored-refresh-token');
            storage.set('bey_user', mockUser);

            const upgradedService = TestBed.runInInjectionContext(() => new SessionService());

            expect(upgradedService.isAuthenticated()).toBe(false);
            expect([storage.get('bey_token'), storage.get('bey_refresh_token'), storage.get('bey_user')]).toEqual([
                null,
                null,
                null
            ]);
        });

        it('keeps the token and the user in memory, never in storage', () => {
            const set = jest.spyOn(storage, 'set');

            service.setUser(mockUser);
            service.setToken(buildAccessToken(['/home']));
            restored();
            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: buildAccessToken(['/documents']) });

            expect(service.isAuthenticated()).toBe(true);
            expect(set).not.toHaveBeenCalled();
            expect(localStorage.length).toBe(0);
        });
    });

    describe('setToken / setUser', () => {
        it('exposes the token and the user decoded from it', () => {
            const token = buildAccessToken(['/documents', '/templates']);

            service.setToken(token);

            expect(service.token()).toBe(token);
            expect(service.getToken()).toBe(token);
            expect(service.isAuthenticated()).toBe(true);
            expect(service.getUser()).toEqual(
                expect.objectContaining({
                    allowedPaths: ['/documents', '/templates'],
                    email: 'ada@example.com',
                    redirectPath: '/documents'
                })
            );
        });

        it('exposes the user it is given as it is', () => {
            service.setUser(mockUser);

            expect(service.user()).toEqual(mockUser);
            expect(service.getUser()).toEqual(mockUser);
        });
    });

    describe('restore', () => {
        it('posts to the refresh endpoint with the cookie and no body, and opens the session it answers', () => {
            const token = buildAccessToken(['/documents']);

            const answers = restored();
            const request = httpTesting.expectOne({ method: 'POST', url: REFRESH_URL });
            request.flush({ accessToken: token });

            expect(request.request.withCredentials).toBe(true);
            expect(request.request.body).toBeNull();
            expect(answers).toEqual([true]);
            expect(service.getToken()).toBe(token);
            expect(service.getUser()?.redirectPath).toBe('/documents');
        });

        it('answers false, without the error modal, when there is no valid cookie', () => {
            const answers = restored();
            httpTesting
                .expectOne(REFRESH_URL)
                .flush({ errorCode: 'unauthorized', messageKey: 'login.invalid-refresh-token' }, UNAUTHORIZED);

            expect(answers).toEqual([false]);
            expect(service.isAuthenticated()).toBe(false);
            expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        });

        it('shares one request between the calls made while it is out, and sends a new one afterwards', () => {
            const first = restored();
            const second = restored();
            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: 'first-token' });

            const third = restored();
            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: 'second-token' });

            expect([first, second, third]).toEqual([[true], [true], [true]]);
            expect(service.getToken()).toBe('second-token');
        });

        it('answers false without a request once it failed, until a session opens again', () => {
            restored();
            httpTesting.expectOne(REFRESH_URL).flush(null, UNAUTHORIZED);

            const refused = restored();
            httpTesting.expectNone(REFRESH_URL);

            service.setToken('signed-in-token');
            const retried = restored();
            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: 'refreshed-token' });

            expect([refused, retried]).toEqual([[false], [true]]);
        });
    });

    describe('clear', () => {
        it('forgets the token and the user, and restores nothing until a session opens again', () => {
            service.setToken(buildAccessToken(['/home']));
            service.setUser(mockUser);

            service.clear();
            const answers = restored();

            expect(service.token()).toBeNull();
            expect(service.user()).toBeNull();
            expect(service.isAuthenticated()).toBe(false);
            expect(answers).toEqual([false]);
            httpTesting.expectNone(REFRESH_URL);
        });
    });

    describe('logout', () => {
        it('posts to the logout endpoint with the cookie and the token, then clears the session and goes to login', () => {
            service.setToken('my-jwt');

            service.logout();
            const request = httpTesting.expectOne({ method: 'POST', url: LOGOUT_URL });

            expect(request.request.withCredentials).toBe(true);
            expect(request.request.headers.get('Authorization')).toBe('Bearer my-jwt');
            expect(service.isAuthenticated()).toBe(true);

            request.flush(null, { status: 204, statusText: 'No Content' });

            expect(service.isAuthenticated()).toBe(false);
            expect(navigate).toHaveBeenCalledWith(['/login']);
        });

        it('clears the session and goes to login also when the request fails, without the error modal', () => {
            service.setToken('my-jwt');

            service.logout();
            httpTesting.expectOne(LOGOUT_URL).flush(null, { status: 500, statusText: 'Server Error' });

            expect(service.isAuthenticated()).toBe(false);
            expect(navigate).toHaveBeenCalledWith(['/login']);
            expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        });
    });
});
