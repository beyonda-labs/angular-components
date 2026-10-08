import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeStorageService } from '@testing/services/fake-storage.service';

import { SessionUser } from './models/session.model';
import { SessionService } from './session.service';

describe('SessionService', () => {
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

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(SessionService);
        storage = TestBed.inject(FakeStorageService);
    });

    describe('initial state', () => {
        it('is not authenticated before a token is set', () => {
            expect(service.isAuthenticated()).toBe(false);
        });

        it('has no token before one is set', () => {
            expect(service.token()).toBeNull();
        });

        it('has no user before one is set', () => {
            expect(service.user()).toBeNull();
        });
    });

    describe('hydration from localStorage', () => {
        it('restores the token from storage when it is created', () => {
            storage.set('bey_token', 'stored-token');

            const hydratedService = TestBed.runInInjectionContext(() => new SessionService());

            expect(hydratedService.getToken()).toBe('stored-token');
            expect(hydratedService.isAuthenticated()).toBe(true);
        });
    });

    describe('setToken / getToken', () => {
        it('stores the token and exposes it', () => {
            service.setToken('my-jwt');

            expect(storage.get('bey_token')).toBe('my-jwt');
            expect(service.token()).toBe('my-jwt');
            expect(service.getToken()).toBe('my-jwt');
        });

        it('is authenticated once a token is set', () => {
            service.setToken('my-jwt');

            expect(service.isAuthenticated()).toBe(true);
        });
    });

    describe('setRefreshToken / getRefreshToken', () => {
        it('stores the refresh token', () => {
            service.setRefreshToken('refresh-jwt');

            expect(storage.get('bey_refresh_token')).toBe('refresh-jwt');
        });

        it('reads the refresh token from storage', () => {
            storage.set('bey_refresh_token', 'refresh-jwt');

            expect(service.getRefreshToken()).toBe('refresh-jwt');
        });
    });

    describe('setUser / getUser', () => {
        it('stores the user and exposes it', () => {
            service.setUser(mockUser);

            expect(storage.get('bey_user')).toEqual(mockUser);
            expect(service.user()).toEqual(mockUser);
            expect(service.getUser()).toEqual(mockUser);
        });
    });

    describe('clear', () => {
        it('removes every session key from storage', () => {
            service.setToken('my-jwt');
            service.setRefreshToken('refresh-jwt');
            service.setUser(mockUser);

            service.clear();

            expect(storage.get('bey_token')).toBeNull();
            expect(storage.get('bey_refresh_token')).toBeNull();
            expect(storage.get('bey_user')).toBeNull();
        });

        it('forgets the token and the user and is no longer authenticated', () => {
            service.setToken('my-jwt');
            service.setUser(mockUser);

            service.clear();

            expect(service.token()).toBeNull();
            expect(service.user()).toBeNull();
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('custom config keys', () => {
        it('stores under the keys given in the config', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    provideBeyTesting({
                        session: { refreshTokenKey: 'app_refresh', tokenKey: 'app_token', userKey: 'app_user' }
                    })
                ]
            });

            const customService = TestBed.inject(SessionService);
            const customStorage = TestBed.inject(FakeStorageService);

            customService.setToken('token');
            customService.setRefreshToken('refresh');
            customService.setUser(mockUser);

            expect(customStorage.get('app_token')).toBe('token');
            expect(customStorage.get('app_refresh')).toBe('refresh');
            expect(customStorage.get('app_user')).toEqual(mockUser);
        });
    });
});
