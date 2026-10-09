import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { buttonByName, controlByName, queryButton, queryControl, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { LoginConfig, LoginConfigParameters, RegisterField } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

const REGISTER_FIELDS: RegisterField[] = [{ name: 'name', type: 'text', required: true }];
const FORGOT_PASSWORD = 'angular-components.login.login.forgot-password';
const FORGOT_EMAIL = 'angular-components.login.forgot-password.email.label';
const BACK_TO_SIGN_IN = 'angular-components.login.back-to-sign-in';

describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let loginHttpService: MockProxy<LoginHttpService>;

    function buildConfig(overrides: Partial<LoginConfigParameters> = {}): LoginConfig {
        return new LoginConfig({
            iconSrc: 'logo.svg',
            orgName: 'Beyonda Labs',
            productDescription: 'demo.pitch',
            productName: 'demo.product',
            ...overrides
        });
    }

    async function render(config: LoginConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(LoginComponent, { config });
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    function buttonWith(label: string): HTMLButtonElement | null {
        return queryButton(fixture, label);
    }

    async function press(label: string): Promise<void> {
        buttonByName(fixture, label).click();
        await settle(fixture);
    }

    async function type(label: string, value: string): Promise<void> {
        const input = controlByName(fixture, label);

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    beforeEach(async () => {
        localStorage.clear();
        (document.activeElement as HTMLElement | null)?.blur();
        loginHttpService = mock<LoginHttpService>();
        loginHttpService.getProviders.mockReturnValue(of([]));
        loginHttpService.getRegisterFields.mockReturnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting(),
                { provide: LoginHttpService, useValue: loginHttpService }
            ]
        }).compileComponents();
    });

    it('presents the organisation, the product and the sign-in form', async () => {
        await render();

        expect(text()).toContain('Beyonda Labs');
        expect(text()).toContain('demo.product');
        expect(text()).toContain('demo.pitch');
        expect(text()).toContain('angular-components.login.title.login');
        expect(fixture.nativeElement.querySelector('#email')).not.toBeNull();
    });

    it('focuses the email field when it opens', async () => {
        await render();

        expect(document.activeElement).toBe(controlByName(fixture, 'angular-components.login.login.email.label'));
    });

    it('resolves its texts from the prefix of the config', async () => {
        await render(buildConfig({ prefix: 'myApp.login' }));

        expect(text()).toContain('myApp.login.title.login');
        expect(buttonWith('myApp.login.login.button.login')).not.toBeNull();
    });

    it('offers registration only when the backend defines register fields', async () => {
        await render();
        expect(buttonWith('angular-components.login.register.button.register')).toBeNull();

        loginHttpService.getRegisterFields.mockReturnValue(of(REGISTER_FIELDS));
        await render();
        buttonWith('angular-components.login.register.button.register')?.click();
        await settle(fixture);

        expect(text()).toContain('angular-components.login.title.register');
        expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();

        buttonWith('angular-components.login.login.button.login')?.click();
        await settle(fixture);

        expect(text()).toContain('angular-components.login.title.login');
        expect(fixture.nativeElement.querySelector('#email')).not.toBeNull();
    });

    it('offers the forgotten password view only when the config enables it, and returns to the sign-in', async () => {
        await render();
        expect(buttonWith(FORGOT_PASSWORD)).toBeNull();

        await render(buildConfig({ isPasswordResetEnabled: true }));
        await press(FORGOT_PASSWORD);

        expect(text()).toContain('angular-components.login.title.forgot-password');
        expect(document.activeElement).toBe(controlByName(fixture, FORGOT_EMAIL));

        await press(BACK_TO_SIGN_IN);

        expect(text()).toContain('angular-components.login.title.login');
        expect(queryControl(fixture, FORGOT_EMAIL)).toBeNull();
    });

    it('opens on the forgotten password view when the route asks for it and the config enables it', async () => {
        TestBed.overrideProvider(ActivatedRoute, {
            useValue: { snapshot: { queryParamMap: convertToParamMap({ view: 'forgot-password' }) } }
        });

        await render(buildConfig({ isPasswordResetEnabled: true }));
        expect(text()).toContain('angular-components.login.title.forgot-password');

        await render();
        expect(text()).toContain('angular-components.login.title.login');
    });

    it('asks to check the inbox when the registration needs a verified email', async () => {
        loginHttpService.getRegisterFields.mockReturnValue(of(REGISTER_FIELDS));
        loginHttpService.register.mockReturnValue(of({ verificationRequired: true }));
        await render();

        await press('angular-components.login.register.button.register');
        await type('angular-components.login.register.name.label', 'Ada');
        await press('angular-components.login.register.button.register');

        expect(text()).toContain('angular-components.login.title.registered');
        expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
            'angular-components.login.registered.message'
        );

        await press(BACK_TO_SIGN_IN);

        expect(text()).toContain('angular-components.login.title.login');
    });
});
