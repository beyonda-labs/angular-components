import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import {
    accessibleDescription,
    buttonByName,
    controlByName,
    queryControl,
    renderComponent,
    settle
} from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionService } from '../../../../services/session/session.service';
import { LoginConfig } from '../../models/login.model';
import { LoginAcceptInvitationComponent } from './login-accept-invitation.component';

const BAD_REQUEST = { status: 400, statusText: 'Bad Request' };
const INVITATION_URL = 'https://api.test/auth/invitation';
const NAME = 'angular-components.login.accept-invitation.name.label';
const PASSWORD = 'angular-components.login.accept-invitation.password.label';
const PASSWORD2 = 'angular-components.login.accept-invitation.password2.label';
const POLICY_URL = 'https://api.test/auth/password-policy';
const STRICT = { isDigitRequired: true, isLowercaseRequired: true, isSymbolRequired: true, isUppercaseRequired: true };
const STRONG = 'Correct-h0rse';
const SURNAME = 'angular-components.login.accept-invitation.surname.label';
const INVITATION = { email: 'ada@example.com', name: 'Ada', surname: 'Lovelace' };
const TOKEN_INVALID = { errorCode: 'bad-request', messageKey: 'account.token-invalid' };
const TOKEN_QUERY = { token: 'invite-token' };
const TRANSLATIONS = {
    en: { 'angular-components': { login: { 'accept-invitation': { intro: 'Invited as {{email}}' } } } }
};

describe('LoginAcceptInvitationComponent', () => {
    let fixture: ComponentFixture<LoginAcceptInvitationComponent>;
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    async function answerPolicy(): Promise<void> {
        httpTesting.expectOne(POLICY_URL).flush(STRICT);
        await settle(fixture);
    }

    function expectInvitationRead(): TestRequest {
        return httpTesting.expectOne(
            request => request.method === 'GET' && request.urlWithParams === `${INVITATION_URL}?token=invite-token`
        );
    }

    async function land(query: Record<string, string> = TOKEN_QUERY): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [LoginAcceptInvitationComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({ translations: TRANSLATIONS }),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        fixture = await renderComponent(LoginAcceptInvitationComponent, {
            config: new LoginConfig({
                iconSrc: 'logo.svg',
                productDescription: 'demo.pitch',
                productName: 'demo.product'
            })
        });
    }

    async function open(invitation: object = INVITATION): Promise<void> {
        await land();
        expectInvitationRead().flush(invitation);
        await settle(fixture);
        await answerPolicy();
    }

    function status(): string {
        return fixture.nativeElement.querySelector('[role="status"]').textContent.trim();
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

    async function accept(): Promise<void> {
        await type(PASSWORD, STRONG);
        await type(PASSWORD2, STRONG);
        buttonByName(fixture, 'angular-components.login.accept-invitation.button.accept').click();
        await settle(fixture);
    }

    beforeEach(() => {
        (document.activeElement as HTMLElement | null)?.blur();
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the invitation of the link, then shows its email and prefills the invited name', async () => {
        await land();

        expect(status()).toBe('angular-components.login.accept-invitation.loading');

        expectInvitationRead().flush(INVITATION);
        await settle(fixture);
        await answerPolicy();

        expect(status()).toBe('');
        expect(text()).toContain('angular-components.login.title.accept-invitation');
        expect(text()).toContain('Invited as ada@example.com');
        expect(controlByName(fixture, NAME).value).toBe('Ada');
        expect(controlByName(fixture, SURNAME).value).toBe('Lovelace');
        expect(document.activeElement).toBe(controlByName(fixture, NAME));
    });

    it('activates the account with the typed details and opens the session', async () => {
        const accessToken = buildAccessToken(['/home']);
        await open({ email: 'ada@example.com' });

        await type(NAME, 'Ada');
        await accept();
        const request = httpTesting.expectOne({ method: 'POST', url: INVITATION_URL });
        request.flush({ accessToken });

        expect(request.request.body).toEqual({
            name: 'Ada',
            password: STRONG,
            password2: STRONG,
            token: 'invite-token'
        });
        expect(TestBed.inject(SessionService).getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('lists the rules of the policy under the password and holds back one that breaks them', async () => {
        await open();

        await type(PASSWORD, 'correct-horse');
        await type(PASSWORD2, 'correct-horse');

        expect(accessibleDescription(controlByName(fixture, PASSWORD))).toContain(
            'angular-components.form.password-field.policy.uppercase'
        );
        expect(accessibleDescription(controlByName(fixture, PASSWORD2))).toBe('');
        expect(buttonByName(fixture, 'angular-components.login.accept-invitation.button.accept').disabled).toBe(true);
    });

    it('explains a link without token without asking the server', async () => {
        await land({});

        httpTesting.expectNone(() => true);
        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(text()).toContain('angular-components.login.accept-invitation.invalid-hint');
    });

    it('explains an invitation the server refuses to read', async () => {
        await land();
        expectInvitationRead().flush(TOKEN_INVALID, BAD_REQUEST);
        await settle(fixture);

        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(text()).toContain('angular-components.login.link-error.invalid');
    });

    it('turns to the explanation of the link when the server refuses its token on accepting', async () => {
        await open();

        await accept();
        httpTesting.expectOne({ method: 'POST', url: INVITATION_URL }).flush(TOKEN_INVALID, BAD_REQUEST);
        await settle(fixture);

        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(queryControl(fixture, PASSWORD)).toBeNull();
    });

    it('offers to try again when the invitation cannot be read', async () => {
        await land();
        expectInvitationRead().flush(null, { status: 503, statusText: 'Service Unavailable' });
        await settle(fixture);

        expect(text()).toContain('angular-components.login.link-error.failed');

        buttonByName(fixture, 'angular-components.login.link-error.retry').click();
        await settle(fixture);
        expectInvitationRead().flush({ email: 'ada@example.com' });
        await settle(fixture);
        await answerPolicy();

        expect(queryControl(fixture, PASSWORD)).not.toBeNull();
    });
});
