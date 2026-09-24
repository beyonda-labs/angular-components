import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
        fixture = TestBed.createComponent(LoginComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    function buttonWith(label: string): HTMLButtonElement | undefined {
        return [...fixture.nativeElement.querySelectorAll<HTMLButtonElement>('button')].find(button =>
            button.textContent?.includes(label)
        );
    }

    beforeEach(async () => {
        localStorage.clear();
        loginHttpService = mock<LoginHttpService>();
        loginHttpService.getProviders.mockReturnValue(of([]));
        loginHttpService.getRegisterFields.mockReturnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [LoginComponent, TranslateModule.forRoot()],
            providers: [provideRouter([]), { provide: LoginHttpService, useValue: loginHttpService }]
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
        expect(buttonWith('myApp.login.login.button.login')).toBeDefined();
    });

    it('offers registration only when the backend defines register fields', async () => {
        await render();
        expect(buttonWith('register.button.register')).toBeUndefined();

        loginHttpService.getRegisterFields.mockReturnValue(of(REGISTER_FIELDS));
        await render();
        buttonWith('register.button.register')?.click();
        await settle();

        expect(text()).toContain('angular-components.login.title.register');
        expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();

        buttonWith('login.button.login')?.click();
        await settle();

        expect(text()).toContain('angular-components.login.title.login');
        expect(fixture.nativeElement.querySelector('#email')).not.toBeNull();
    });

    it('swaps the background with the theme', async () => {
        const themeService = TestBed.inject(ThemeService);
        await render();
        const body = fixture.nativeElement.querySelector('main').parentElement as HTMLElement;

        expect(body.style.backgroundImage).toContain('login-bg-light');

        themeService.setTheme('dark');
        await settle();

        expect(body.style.backgroundImage).toContain('login-bg-dark');
    });
});
