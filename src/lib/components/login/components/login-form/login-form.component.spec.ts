import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, controlByName, queryButton, renderComponent, settle } from '@testing/dom';
import { mock, MockProxy } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';

import { LoginConfig, LoginConfigParameters, LoginProviderConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginFormComponent } from './login-form.component';

const FORGOT_PASSWORD = 'angular-components.login.login.forgot-password';
const RESEND = 'angular-components.login.login.unverified.resend';

function buildRefusal(messageKey: string, messageParameters: Record<string, unknown> = {}): HttpErrorResponse {
    return new HttpErrorResponse({ error: { errorCode: 'forbidden', messageKey, messageParameters }, status: 403 });
}

describe('LoginFormComponent', () => {
    let fixture: ComponentFixture<LoginFormComponent>;
    let loginHttpService: MockProxy<LoginHttpService>;
    let loginSessionService: MockProxy<LoginSessionService>;

    async function render(
        providers: LoginProviderConfig[] = [],
        overrides: Partial<LoginConfigParameters> = {}
    ): Promise<void> {
        fixture = await renderComponent(LoginFormComponent, {
            config: new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product', ...overrides }),
            providers
        });
    }

    async function type(id: string, value: string): Promise<void> {
        const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    async function signIn(email: string): Promise<void> {
        await type('email', email);
        await type('password', 'secret');
        submitButton().click();
        await settle(fixture);
    }

    function status(): string {
        return fixture.nativeElement.querySelector('[role="status"]')?.textContent?.trim() ?? '';
    }

    function submitButton(): HTMLButtonElement {
        return buttonByName(fixture, 'angular-components.login.login.button.login');
    }

    async function press(label: string): Promise<void> {
        buttonByName(fixture, label).click();
        await settle(fixture);
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
        const response = { accessToken: 'access' };
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

    it('lets the browser fill in the saved credentials', async () => {
        await render();

        expect(controlByName(fixture, 'angular-components.login.login.email.label').getAttribute('autocomplete')).toBe(
            'email'
        );
        expect(
            controlByName(fixture, 'angular-components.login.login.password.label').getAttribute('autocomplete')
        ).toBe('current-password');
    });

    it('offers the forgotten password link only when the config enables it, and reports its click', async () => {
        const forgotPasswordClick = jest.fn();
        await render();
        expect(queryButton(fixture, FORGOT_PASSWORD)).toBeNull();

        await render([], { isPasswordResetEnabled: true });
        fixture.componentInstance.forgotPasswordClick.subscribe(forgotPasswordClick);
        buttonByName(fixture, FORGOT_PASSWORD).click();

        expect(forgotPasswordClick).toHaveBeenCalled();
    });

    it('offers to resend the verification email when the server refuses an unverified one', async () => {
        loginHttpService.login.mockReturnValue(
            throwError(() => buildRefusal('login.email-not-verified', { email: 'ada@example.com' }))
        );
        loginHttpService.resendVerification.mockReturnValue(of(undefined));
        await render();

        await signIn('ada@example.com');

        expect(fixture.nativeElement.textContent).toContain('angular-components.login.login.unverified.message');
        expect(status()).toBe('');

        await press(RESEND);

        expect(loginHttpService.resendVerification).toHaveBeenCalledWith('ada@example.com');
        expect(status()).toBe('angular-components.login.login.unverified.sent');
        expect(loginSessionService.open).not.toHaveBeenCalled();
    });

    it('offers no resend for any other refusal', async () => {
        loginHttpService.login.mockReturnValue(throwError(() => buildRefusal('login.account-inactive')));
        await render();

        await signIn('ada@example.com');

        expect(queryButton(fixture, RESEND)).toBeNull();
    });
});
