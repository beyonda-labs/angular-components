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
        role: 'admin',
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

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('initial state', () => {
        it('should not be authenticated initially', () => {
            expect(service.isAuthenticated()).toBe(false);
        });

        it('should have null token initially', () => {
            expect(service.token()).toBeNull();
        });

        it('should have null user initially', () => {
            expect(service.user()).toBeNull();
        });
    });

    describe('hydration from localStorage', () => {
        it('should hydrate token from localStorage on construction', () => {
            storageService.get.mockImplementation((key: string) => {
                if (key === 'bey_token') {
                    return 'stored-token';
                }

                return null;
            });

            const hydratedService = TestBed.inject(SessionService);

            expect(hydratedService.getToken()).toBeNull();
        });
    });

    describe('setToken / getToken', () => {
        it('should store token in localStorage and update signal', () => {
            service.setToken('my-jwt');

            expect(storageService.set).toHaveBeenCalledWith('bey_token', 'my-jwt');
            expect(service.token()).toBe('my-jwt');
            expect(service.getToken()).toBe('my-jwt');
        });

        it('should set isAuthenticated to true after setToken', () => {
            service.setToken('my-jwt');

            expect(service.isAuthenticated()).toBe(true);
        });
    });

    describe('setRefreshToken / getRefreshToken', () => {
        it('should store refresh token in localStorage', () => {
            service.setRefreshToken('refresh-jwt');

            expect(storageService.set).toHaveBeenCalledWith('bey_refresh_token', 'refresh-jwt');
        });

        it('should retrieve refresh token from localStorage', () => {
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
        it('should store user in localStorage and update signal', () => {
            service.setUser(mockUser);

            expect(storageService.set).toHaveBeenCalledWith('bey_user', mockUser);
            expect(service.user()).toEqual(mockUser);
            expect(service.getUser()).toEqual(mockUser);
        });
    });

    describe('clear', () => {
        it('should remove all session keys from localStorage', () => {
            service.setToken('my-jwt');
            service.setUser(mockUser);

            service.clear();

            expect(storageService.remove).toHaveBeenCalledWith('bey_token');
            expect(storageService.remove).toHaveBeenCalledWith('bey_refresh_token');
            expect(storageService.remove).toHaveBeenCalledWith('bey_user');
        });

        it('should reset signals to null', () => {
            service.setToken('my-jwt');
            service.setUser(mockUser);

            service.clear();

            expect(service.token()).toBeNull();
            expect(service.user()).toBeNull();
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('custom config keys', () => {
        it('should use custom localStorage keys from config', () => {
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
