import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG, SessionUser } from './models/session.model';
import { SessionService } from './session.service';

function runGuard(path: string) {
    const route = { routeConfig: { path } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard', () => {
    const sessionService = {
        getUser: jest.fn(),
        isAuthenticated: jest.fn()
    };

    const router = {
        createUrlTree: jest.fn()
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
        router.createUrlTree.mockReturnValue({} as UrlTree);

        TestBed.configureTestingModule({
            providers: [
                { provide: SessionService, useValue: sessionService },
                { provide: Router, useValue: router },
                { provide: SESSION_CONFIG, useValue: DEFAULT_SESSION_CONFIG }
            ]
        });
    });

    describe('authentication check', () => {
        it('should redirect to loginRoute when not authenticated', () => {
            sessionService.isAuthenticated.mockReturnValue(false);

            runGuard('dashboard');

            expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
        });

        it('should redirect to loginRoute when authenticated but no user data', () => {
            sessionService.isAuthenticated.mockReturnValue(true);
            sessionService.getUser.mockReturnValue(null);

            runGuard('dashboard');

            expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
        });
    });

    describe('authorization check', () => {
        it('should allow access when route is in allowedPaths', () => {
            sessionService.isAuthenticated.mockReturnValue(true);
            sessionService.getUser.mockReturnValue(mockUser);

            const result = runGuard('dashboard');

            expect(result).toBe(true);
        });

        it('should allow access for sub-paths of allowedPaths', () => {
            sessionService.isAuthenticated.mockReturnValue(true);
            sessionService.getUser.mockReturnValue(mockUser);

            const result = runGuard('settings/profile');

            expect(result).toBe(true);
        });

        it('should redirect to redirectPath when route is not in allowedPaths', () => {
            sessionService.isAuthenticated.mockReturnValue(true);
            sessionService.getUser.mockReturnValue(mockUser);

            runGuard('admin/users');

            expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('custom config', () => {
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

            sessionService.isAuthenticated.mockReturnValue(false);
            router.createUrlTree.mockReturnValue({} as UrlTree);

            runGuard('dashboard');

            expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/signin']);
        });
    });
});
