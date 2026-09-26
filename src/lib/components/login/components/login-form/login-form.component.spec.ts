import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { LoginConfig, LoginProviderConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
    let fixture: ComponentFixture<LoginFormComponent>;
    let loginHttpService: MockProxy<LoginHttpService>;
    let loginSessionService: MockProxy<LoginSessionService>;

    async function render(providers: LoginProviderConfig[] = []): Promise<void> {
        fixture = await renderComponent(LoginFormComponent, {
            config: new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product' }),
            providers
        });
    }

    async function type(id: string, value: string): Promise<void> {
        const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    function submitButton(): HTMLButtonElement {
        return buttonByName(fixture, 'angular-components.login.login.button.login');
    }

    beforeEach(async () => {
        loginHttpService = mock<LoginHttpService>();
        loginSessionService = mock<LoginSessionService>();

        await TestBed.configureTestingModule({
            imports: [LoginFormComponent, TranslateModule.forRoot()],
            providers: [
                { provide: LoginHttpService, useValue: loginHttpService },
                { provide: LoginSessionService, useValue: loginSessionService }
            ]
        }).compileComponents();
    });

    it('keeps sign-in disabled until an email and a password are typed', async () => {
        await render();
        expect(submitButton().disabled).toBe(true);

        await type('email', 'not-an-email');
        await type('password', 'secret');
        expect(submitButton().disabled).toBe(true);

        await type('email', 'ada@example.com');
        expect(submitButton().disabled).toBe(false);
    });

    it('signs in with the typed credentials and opens the session', async () => {
        const response = { accessToken: 'access', refreshToken: 'refresh' };
        loginHttpService.login.mockReturnValue(of(response));
        await render();

        await type('email', 'ada@example.com');
        await type('password', 'secret');
        submitButton().click();

        expect(loginHttpService.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'secret' });
        expect(loginSessionService.open).toHaveBeenCalledWith(response);
    });

    it('offers the providers it is given', async () => {
        await render([{ id: 'google', authUrl: 'https://google' }]);

        expect(fixture.nativeElement.textContent).toContain('angular-components.login.login.signin-with');
    });
});
