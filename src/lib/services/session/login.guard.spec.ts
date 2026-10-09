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

import { loginGuard } from './login.guard';

const REFRESH_URL = 'https://api.test/auth/refresh';

function buildAccessToken(allowedPaths: string[]): string {
    return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
}

function redirection(result: GuardResult): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
}

function runGuard(): Promise<GuardResult> {
    const result = TestBed.runInInjectionContext(() =>
        loginGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    return isObservable(result) ? firstValueFrom(result) : Promise.resolve(result);
}

describe('loginGuard', () => {
    let httpTesting: HttpTestingController;

    function configure(config?: TestingConfig): void {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting(config)] });
        httpTesting = TestBed.inject(HttpTestingController);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    it('sends a signed-in user to their redirectPath without restoring', async () => {
        configure({ user: { allowedPaths: ['/dashboard'], email: 'john@example.com', redirectPath: '/dashboard' } });

        expect(redirection(await runGuard())).toBe('/dashboard');
        httpTesting.expectNone(REFRESH_URL);
    });

    it('restores the session and sends the restored user to their redirectPath', async () => {
        configure();

        const result = runGuard();
        httpTesting
            .expectOne({ method: 'POST', url: REFRESH_URL })
            .flush({ accessToken: buildAccessToken(['/documents']) });

        expect(redirection(await result)).toBe('/documents');
    });

    it('opens the login page when the session cannot be restored', async () => {
        configure();

        const result = runGuard();
        httpTesting.expectOne(REFRESH_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

        await expect(result).resolves.toBe(true);
    });
});
