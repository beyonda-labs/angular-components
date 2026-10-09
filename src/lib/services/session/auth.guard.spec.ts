import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    GuardResult,
    provideRouter,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { TestingConfig } from '@testing/models/testing.model';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { firstValueFrom, isObservable } from 'rxjs';

import { authGuard } from './auth.guard';
import { SessionUser } from './models/session.model';

const REFRESH_URL = 'https://api.test/auth/refresh';
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

function buildAccessToken(allowedPaths: string[]): string {
    return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
}

function redirection(result: GuardResult): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
}

function runGuard(path: string): Promise<GuardResult> {
    const route = { routeConfig: { path } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    return isObservable(result) ? firstValueFrom(result) : Promise.resolve(result);
}

describe('authGuard', () => {
    let httpTesting: HttpTestingController;

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
        httpTesting = TestBed.inject(HttpTestingController);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    describe('with a token', () => {
        beforeEach(() => {
            configure({ user: mockUser });
        });

        it('allows a route listed in allowedPaths without restoring', async () => {
            await expect(runGuard('dashboard')).resolves.toBe(true);
            httpTesting.expectNone(REFRESH_URL);
        });

        it('allows the sub-paths of a route in allowedPaths', async () => {
            await expect(runGuard('settings/profile')).resolves.toBe(true);
        });

        it('redirects to redirectPath when the route is not in allowedPaths', async () => {
            expect(redirection(await runGuard('admin/users'))).toBe('/dashboard');
        });
    });

    it('redirects to the login route when authenticated without a user', async () => {
        configure({ token: 'opaque-token' });

        expect(redirection(await runGuard('dashboard'))).toBe('/login');
    });

    describe('without a token', () => {
        it('restores the session and lets a route of the restored user through', async () => {
            configure();

            const result = runGuard('documents');
            httpTesting.expectOne({ method: 'POST', url: REFRESH_URL }).flush({
                accessToken: buildAccessToken(['/documents'])
            });

            await expect(result).resolves.toBe(true);
        });

        it('restores the session and sends the restored user away from a route outside allowedPaths', async () => {
            configure();

            const result = runGuard('admin');
            httpTesting.expectOne(REFRESH_URL).flush({ accessToken: buildAccessToken(['/documents']) });

            expect(redirection(await result)).toBe('/documents');
        });

        it('redirects to the login route when the session cannot be restored', async () => {
            configure();

            const result = runGuard('dashboard');
            httpTesting.expectOne(REFRESH_URL).flush(null, UNAUTHORIZED);

            expect(redirection(await result)).toBe('/login');
        });

        it('redirects to the login route given in the config', async () => {
            configure({ session: { loginRoute: '/auth/signin' } });

            const result = runGuard('dashboard');
            httpTesting.expectOne(REFRESH_URL).flush(null, UNAUTHORIZED);

            expect(redirection(await result)).toBe('/auth/signin');
        });
    });
});
