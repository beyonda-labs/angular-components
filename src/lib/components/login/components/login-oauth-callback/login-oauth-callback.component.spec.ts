import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { renderComponent } from '@testing/dom';
import { mock, MockProxy } from 'jest-mock-extended';

import { LoginSessionService } from '../../services/login-session.service';
import { LoginOAuthCallbackComponent } from './login-oauth-callback.component';

describe('LoginOAuthCallbackComponent', () => {
    let loginSessionService: MockProxy<LoginSessionService>;
    let navigate: jest.SpyInstance;

    async function land(query: Record<string, string>): Promise<void> {
        loginSessionService = mock<LoginSessionService>();

        await TestBed.configureTestingModule({
            imports: [LoginOAuthCallbackComponent],
            providers: [
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
                { provide: LoginSessionService, useValue: loginSessionService }
            ]
        }).compileComponents();

        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        await renderComponent(LoginOAuthCallbackComponent);
    }

    it('opens the session with the tokens the provider sent back', async () => {
        await land({ accessToken: 'access', refreshToken: 'refresh' });

        expect(loginSessionService.open).toHaveBeenCalledWith({ accessToken: 'access', refreshToken: 'refresh' });
        expect(navigate).not.toHaveBeenCalled();
    });

    it('returns to the login page when the provider reports an error or a token is missing', async () => {
        await land({ accessToken: 'access', refreshToken: 'refresh', error: 'denied' });
        expect(navigate).toHaveBeenCalledWith(['/login']);

        TestBed.resetTestingModule();
        await land({ accessToken: 'access' });
        expect(navigate).toHaveBeenCalledWith(['/login']);

        expect(loginSessionService.open).not.toHaveBeenCalled();
    });
});
