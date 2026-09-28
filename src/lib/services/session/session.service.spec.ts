import { TestBed } from '@angular/core/testing';

import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG, SessionUser } from './models/session.model';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

describe('SessionService', () => {
    let service: SessionService;

    const storageService = {
        get: jest.fn(),
        remove: jest.fn(),
        set: jest.fn()
    };

    const mockUser: SessionUser = {
        allowedPaths: ['/dashboard', '/settings'],
        email: 'john@example.com',
        name: 'John',
        redirectPath: '/dashboard',
        roles: ['admin'],
        surname: 'Doe'
    };

    beforeEach(() => {
        jest.resetAllMocks();
        storageService.get.mockReturnValue(null);

        TestBed.configureTestingModule({
            providers: [
                SessionService,
                { provide: StorageService, useValue: storageService },
                { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG }
            ]
        });

        service = TestBed.inject(SessionService);
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
            storageService.get.mockImplementation((key: string) => {
                if (key === 'bey_token') {
                    return 'stored-token';
                }

                return null;
            });

            const hydratedService = TestBed.runInInjectionContext(() => new SessionService());

            expect(hydratedService.getToken()).toBe('stored-token');
            expect(hydratedService.isAuthenticated()).toBe(true);
        });
    });

    describe('setToken / getToken', () => {
        it('stores the token and exposes it', () => {
            service.setToken('my-jwt');

            expect(storageService.set).toHaveBeenCalledWith('bey_token', 'my-jwt');
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

            expect(storageService.set).toHaveBeenCalledWith('bey_refresh_token', 'refresh-jwt');
        });

        it('reads the refresh token from storage', () => {
            storageService.get.mockImplementation((key: string) => {
                if (key === 'bey_refresh_token') {
                    return 'refresh-jwt';
                }

                return null;
            });

            expect(service.getRefreshToken()).toBe('refresh-jwt');
        });
    });

    describe('setUser / getUser', () => {
        it('stores the user and exposes it', () => {
            service.setUser(mockUser);

            expect(storageService.set).toHaveBeenCalledWith('bey_user', mockUser);
            expect(service.user()).toEqual(mockUser);
            expect(service.getUser()).toEqual(mockUser);
        });
    });

    describe('clear', () => {
        it('removes every session key from storage', () => {
            service.setToken('my-jwt');
            service.setUser(mockUser);

            service.clear();

            expect(storageService.remove).toHaveBeenCalledWith('bey_token');
            expect(storageService.remove).toHaveBeenCalledWith('bey_refresh_token');
            expect(storageService.remove).toHaveBeenCalledWith('bey_user');
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
            storageService.get.mockReturnValue(null);

            TestBed.configureTestingModule({
                providers: [
                    SessionService,
                    { provide: StorageService, useValue: storageService },
                    {
                        provide: SESSION_CONFIG,
                        useValue: {
                            ...DEFAULT_SESSION_CONFIG,
                            refreshTokenKey: 'app_refresh',
                            tokenKey: 'app_token',
                            userKey: 'app_user'
                        }
                    }
                ]
            });

            const customService = TestBed.inject(SessionService);

            customService.setToken('token');
            customService.setRefreshToken('refresh');
            customService.setUser(mockUser);

            expect(storageService.set).toHaveBeenCalledWith('app_token', 'token');
            expect(storageService.set).toHaveBeenCalledWith('app_refresh', 'refresh');
            expect(storageService.set).toHaveBeenCalledWith('app_user', mockUser);
        });
    });
});
