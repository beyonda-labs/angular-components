import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ThemeService } from '../../services/theme/theme.service';
import { LoginComponent } from './login.component';
import { LoginConfig, LoginConfigParameters, RegisterField } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

const REGISTER_FIELDS: RegisterField[] = [{ name: 'name', type: 'text', required: true }];

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

    beforeEach(async () => {
        localStorage.clear();
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

    it('swaps the background with the theme', async () => {
        const themeService = TestBed.inject(ThemeService);
        await render();
        const body = fixture.nativeElement.querySelector('main').parentElement as HTMLElement;

        expect(body.style.backgroundImage).toContain('login-bg-light');

        themeService.setTheme('dark');
        await settle(fixture);

        expect(body.style.backgroundImage).toContain('login-bg-dark');
    });
});
