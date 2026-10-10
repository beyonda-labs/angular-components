import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import {
    accessibleDescription,
    buttonByName,
    controlByName,
    queryAll,
    queryControl,
    renderComponent,
    settle
} from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { SessionService } from '../../../../services/session/session.service';
import { LoginConfig } from '../../models/login.model';
import { LoginResetPasswordComponent } from './login-reset-password.component';

const POLICY_URL = 'https://api.test/auth/password-policy';
const RESET_URL = 'https://api.test/auth/password/reset';
const PASSWORD = 'angular-components.login.reset-password.password.label';
const PASSWORD2 = 'angular-components.login.reset-password.password2.label';
const SAVE = 'angular-components.login.reset-password.button.save';
const STRICT = { isDigitRequired: true, isLowercaseRequired: true, isSymbolRequired: true, isUppercaseRequired: true };
const STRONG = 'Correct-h0rse';
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

    async function open(): Promise<void> {
        await land();
        httpTesting.expectOne(POLICY_URL).flush(STRICT);
        await settle(fixture);
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
        await open();

        expect(text()).toContain('demo.product');
        expect(text()).toContain('angular-components.login.title.reset-password');
        expect(document.activeElement).toBe(controlByName(fixture, PASSWORD));
        expect(controlByName(fixture, PASSWORD2).getAttribute('autocomplete')).toBe('new-password');
    });

    it('saves the new password with the token of the link and opens the session', async () => {
        const accessToken = buildAccessToken(['/home']);
        await open();

        await save(STRONG);
        const request = httpTesting.expectOne({ method: 'POST', url: RESET_URL });
        request.flush({ accessToken });

        expect(request.request.body).toEqual({ password: STRONG, password2: STRONG, token: 'reset-token' });
        expect(TestBed.inject(SessionService).getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('refuses to save a confirmation that differs from the password', async () => {
        await open();

        await type(PASSWORD, STRONG);
        await type(PASSWORD2, 'other');

        expect(buttonByName(fixture, SAVE).disabled).toBe(true);
        httpTesting.expectNone(RESET_URL);
    });

    it('lists the rules of the policy under the password and refuses to save one that breaks them', async () => {
        await open();

        await save('correct-horse');

        expect(accessibleDescription(controlByName(fixture, PASSWORD))).toContain(
            'angular-components.form.password-field.policy.digit'
        );
        expect(accessibleDescription(controlByName(fixture, PASSWORD2))).toBe('');
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
        httpTesting.expectNone(POLICY_URL);
    });

    it('turns to the explanation of the link when the server refuses its token', async () => {
        await open();

        await save(STRONG);
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

    it('keeps the form and shows the reason when the server refuses the password', async () => {
        await open();

        await save(STRONG);
        httpTesting
            .expectOne(RESET_URL)
            .flush(
                { errorCode: 'bad-request', messageKey: 'password.too-short', messageParameters: { min: 16 } },
                { status: 400, statusText: 'Bad Request' }
            );
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.password.too-short' })
        ]);
        expect(text()).toContain('angular-components.login.title.reset-password');
        expect(queryControl(fixture, PASSWORD)).not.toBeNull();
    });
});
