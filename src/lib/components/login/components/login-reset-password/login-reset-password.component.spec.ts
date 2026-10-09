import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { buttonByName, controlByName, queryAll, queryControl, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { SessionService } from '../../../../services/session/session.service';
import { LoginConfig } from '../../models/login.model';
import { LoginResetPasswordComponent } from './login-reset-password.component';

const RESET_URL = 'https://api.test/auth/password/reset';
const PASSWORD = 'angular-components.login.reset-password.password.label';
const PASSWORD2 = 'angular-components.login.reset-password.password2.label';
const SAVE = 'angular-components.login.reset-password.button.save';
const TOKEN_QUERY = { token: 'reset-token' };

describe('LoginResetPasswordComponent', () => {
    let fixture: ComponentFixture<LoginResetPasswordComponent>;
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    async function land(query: Record<string, string> = TOKEN_QUERY): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [LoginResetPasswordComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting(),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        fixture = await renderComponent(LoginResetPasswordComponent, {
            config: new LoginConfig({
                iconSrc: 'logo.svg',
                productDescription: 'demo.pitch',
                productName: 'demo.product'
            })
        });
    }

    function links(): string[] {
        return queryAll(fixture, 'a').map(anchor => anchor.textContent?.trim() ?? '');
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    async function type(label: string, value: string): Promise<void> {
        const input = controlByName(fixture, label);

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    async function save(password: string, password2 = password): Promise<void> {
        await type(PASSWORD, password);
        await type(PASSWORD2, password2);
        buttonByName(fixture, SAVE).click();
        await settle(fixture);
    }

    beforeEach(() => {
        (document.activeElement as HTMLElement | null)?.blur();
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('asks for the new password twice, in the shell of the login, starting on the first field', async () => {
        await land();

        expect(text()).toContain('demo.product');
        expect(text()).toContain('angular-components.login.title.reset-password');
        expect(document.activeElement).toBe(controlByName(fixture, PASSWORD));
        expect(controlByName(fixture, PASSWORD2).getAttribute('autocomplete')).toBe('new-password');
    });

    it('saves the new password with the token of the link and opens the session', async () => {
        const accessToken = buildAccessToken(['/home']);
        await land();

        await save('secret');
        const request = httpTesting.expectOne({ method: 'POST', url: RESET_URL });
        request.flush({ accessToken });

        expect(request.request.body).toEqual({ password: 'secret', password2: 'secret', token: 'reset-token' });
        expect(TestBed.inject(SessionService).getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('refuses to save a confirmation that differs from the password', async () => {
        await land();

        await type(PASSWORD, 'secret');
        await type(PASSWORD2, 'other');

        expect(buttonByName(fixture, SAVE).disabled).toBe(true);
        httpTesting.expectNone(RESET_URL);
    });

    it('explains a link without token and links to a new one', async () => {
        await land({});

        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(links()).toEqual([
            'angular-components.login.link-error.request-new-link',
            'angular-components.login.back-to-sign-in'
        ]);
        expect(queryControl(fixture, PASSWORD)).toBeNull();
    });

    it('turns to the explanation of the link when the server refuses its token', async () => {
        await land();

        await save('secret');
        httpTesting
            .expectOne(RESET_URL)
            .flush(
                { errorCode: 'bad-request', messageKey: 'account.token-invalid' },
                { status: 400, statusText: 'Bad Request' }
            );
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toHaveLength(1);
        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(queryControl(fixture, PASSWORD)).toBeNull();
    });

    it('keeps the form when the server refuses something else', async () => {
        await land();

        await save('short');
        httpTesting
            .expectOne(RESET_URL)
            .flush(
                { errorCode: 'invalid-field-length', messageKey: 'invalid-field-length' },
                { status: 400, statusText: 'Bad Request' }
            );
        await settle(fixture);

        expect(text()).toContain('angular-components.login.title.reset-password');
        expect(queryControl(fixture, PASSWORD)).not.toBeNull();
    });
});
