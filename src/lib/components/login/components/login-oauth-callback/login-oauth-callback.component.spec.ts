import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { renderComponent } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionService } from '../../../../services/session/session.service';
import { LoginOAuthCallbackComponent } from './login-oauth-callback.component';

const REFRESH_URL = 'https://api.test/auth/refresh';

describe('LoginOAuthCallbackComponent', () => {
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    async function land(query: Record<string, string> = {}): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [LoginOAuthCallbackComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting(),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        await renderComponent(LoginOAuthCallbackComponent);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    it.each(['unauthorized', 'account-inactive', 'organization-inactive'])(
        'returns to the login page without restoring when the server reports %s',
        async error => {
            await land({ error });

            httpTesting.expectNone(REFRESH_URL);
            expect(navigate).toHaveBeenCalledWith(['/login']);
        }
    );

    it('opens the session the server set in its cookie and goes where the user is allowed', async () => {
        const accessToken = buildAccessToken(['/home']);
        await land();

        httpTesting.expectOne({ method: 'POST', url: REFRESH_URL }).flush({ accessToken });

        expect(TestBed.inject(SessionService).getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('returns to the login page when the session cannot be restored', async () => {
        await land();

        httpTesting.expectOne(REFRESH_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(TestBed.inject(SessionService).isAuthenticated()).toBe(false);
        expect(navigate).toHaveBeenCalledWith(['/login']);
    });
});
