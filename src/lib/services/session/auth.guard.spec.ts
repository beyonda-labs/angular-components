import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TestingConfig } from '@testing/models/testing.model';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { authGuard } from './auth.guard';
import { SessionUser } from './models/session.model';

function runGuard(path: string) {
    const route = { routeConfig: { path } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    return TestBed.runInInjectionContext(() => authGuard(route, state));
}

function redirection(result: ReturnType<typeof runGuard>): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
}

describe('authGuard', () => {
    const mockUser: SessionUser = {
        allowedPaths: ['/dashboard', '/settings'],
        email: 'john@example.com',
        name: 'John',
        redirectPath: '/dashboard',
        roles: ['admin'],
        surname: 'Doe'
    };

    function configure(config?: TestingConfig): void {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting(config)] });
    }

    describe('authentication check', () => {
        it('redirects to the login route when not authenticated', () => {
            configure();

            expect(redirection(runGuard('dashboard'))).toBe('/login');
        });

        it('redirects to the login route when authenticated without a user', () => {
            configure({ token: 'opaque-token' });

            expect(redirection(runGuard('dashboard'))).toBe('/login');
        });
    });

    describe('authorization check', () => {
        beforeEach(() => {
            configure({ user: mockUser });
        });

        it('allows a route listed in allowedPaths', () => {
            const result = runGuard('dashboard');

            expect(result).toBe(true);
        });

        it('allows the sub-paths of a route in allowedPaths', () => {
            const result = runGuard('settings/profile');

            expect(result).toBe(true);
        });

        it('redirects to redirectPath when the route is not in allowedPaths', () => {
            expect(redirection(runGuard('admin/users'))).toBe('/dashboard');
        });
    });

    describe('custom config', () => {
        it('redirects to the login route given in the config', () => {
            configure({ session: { loginRoute: '/auth/signin' } });

            expect(redirection(runGuard('dashboard'))).toBe('/auth/signin');
        });
    });
});
