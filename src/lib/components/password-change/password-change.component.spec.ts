import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
    accessibleDescription,
    buttonByName,
    controlByName,
    queryAll,
    queryControl,
    renderComponent,
    settle,
    textsOf
} from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { AccountProfile } from '../../services/account/models/account.model';
import { SessionService } from '../../services/session/session.service';
import { PasswordChangeConfig } from './models/password-change.model';
import { PasswordChangeComponent } from './password-change.component';

const PASSWORD_URL = 'https://api.test/api/account/password';
const POLICY_URL = 'https://api.test/auth/password-policy';
const PREFIX = 'angular-components.password-change';
const RULE = 'angular-components.form.password-field.policy';
const STRICT = { isDigitRequired: true, isLowercaseRequired: true, isSymbolRequired: true, isUppercaseRequired: true };
const CURRENT = `${PREFIX}.password.current-password.label`;
const PASSWORD = `${PREFIX}.password.password.label`;
const CONFIRMATION = `${PREFIX}.password.password2.label`;

describe('PasswordChangeComponent', () => {
    let fixture: ComponentFixture<PasswordChangeComponent>;
    let httpTesting: HttpTestingController;

    function buildProfile(overrides: Partial<AccountProfile> = {}): AccountProfile {
        return { email: 'ada@example.test', hasPassword: true, id: 'u1', roles: ['editor'], ...overrides };
    }

    async function render(profile = buildProfile(), config = new PasswordChangeConfig()): Promise<void> {
        fixture = await renderComponent(PasswordChangeComponent, { config });
        httpTesting.expectOne(`https://api.test/api${config.baseUrl}`).flush(profile);
        await settle(fixture);

        if (profile.hasPassword) {
            httpTesting.expectOne(POLICY_URL).flush(STRICT);
            await settle(fixture);
        }
    }

    async function type(label: string, value: string): Promise<void> {
        const input = controlByName(fixture, label);

        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        await settle(fixture);
    }

    async function fill(current: string, password: string, confirmation = password): Promise<void> {
        await type(CURRENT, current);
        await type(PASSWORD, password);
        await type(CONFIRMATION, confirmation);
    }

    function saveButton(): HTMLButtonElement {
        return buttonByName(fixture, `${PREFIX}.save`);
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PasswordChangeComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    user: { allowedPaths: ['/account'], email: 'ada@example.test', redirectPath: '/account' }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('asks for the current password, the new one and its confirmation under its title', async () => {
        await render();

        expect(text()).toContain(`${PREFIX}.title`);
        expect(text()).toContain(`${PREFIX}.description`);
        expect(controlByName(fixture, CURRENT).value).toBe('');
        expect(controlByName(fixture, PASSWORD).value).toBe('');
        expect(controlByName(fixture, CONFIRMATION).value).toBe('');
    });

    it('lists the rules of the policy under the new password alone and describes nothing else', async () => {
        await render();
        const description = accessibleDescription(controlByName(fixture, PASSWORD));

        expect(description).toContain(`${RULE}.length`);
        expect(description).toContain(`${RULE}.uppercase`);
        expect(description).toContain(`${RULE}.symbol`);
        expect(accessibleDescription(controlByName(fixture, CURRENT))).toBe('');
        expect(accessibleDescription(controlByName(fixture, CONFIRMATION))).toBe('');
        expect(accessibleDescription(saveButton())).toBe('');
    });

    it('enables its single button only once the three passwords are valid', async () => {
        await render();

        expect(saveButton().disabled).toBe(true);

        await type(CURRENT, 'old-secret');
        expect(saveButton().disabled).toBe(true);

        await type(PASSWORD, 'New-secr3t');
        await type(CONFIRMATION, 'New-secr3t');
        expect(saveButton().disabled).toBe(false);
    });

    it('holds back a new password while it breaks a rule of the policy the server answers', async () => {
        await render();

        await fill('old-secret', 'new-secret');
        expect(saveButton().disabled).toBe(true);
        expect(controlByName(fixture, PASSWORD).getAttribute('aria-invalid')).toBe('true');
        expect(accessibleDescription(controlByName(fixture, PASSWORD))).toContain(`${RULE}.digit ${RULE}.unmet`);

        await fill('old-secret', 'New-secr3t');
        expect(saveButton().disabled).toBe(false);
    });

    it('asks the server for no policy when the account has no password', async () => {
        await render(buildProfile({ hasPassword: false }));

        httpTesting.expectNone(POLICY_URL);
    });

    it('holds the new password back while its confirmation does not match', async () => {
        await render();

        await fill('old-secret', 'New-secr3t', 'Other-secr3t');

        expect(textsOf(queryAll(fixture, '[role="alert"]'))).toEqual([`${PREFIX}.password.password2.mismatch`]);
        expect(saveButton().disabled).toBe(true);
    });

    it('changes the password, confirms it, opens the session it answers and empties the form', async () => {
        await render();

        await fill('old-secret', 'New-secr3t');
        saveButton().click();
        const request = httpTesting.expectOne(PASSWORD_URL);
        request.flush({ accessToken: 'fresh-token' });
        await settle(fixture);

        expect(request.request.method).toBe('PUT');
        expect(request.request.withCredentials).toBe(true);
        expect(request.request.body).toEqual({
            currentPassword: 'old-secret',
            password: 'New-secr3t',
            password2: 'New-secr3t'
        });
        expect(TestBed.inject(SessionService).token()).toBe('fresh-token');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.success` }]);
        expect(controlByName(fixture, CURRENT).value).toBe('');
        expect(saveButton().disabled).toBe(true);
    });

    it('tells a user without a password how to set one under its title, instead of asking for the current one', async () => {
        await render(buildProfile({ hasPassword: false }));

        expect(text()).toContain(`${PREFIX}.title`);
        expect(text()).toContain(`${PREFIX}.description`);
        expect(text()).toContain(`${PREFIX}.no-password`);
        expect(queryControl(fixture, CURRENT)).toBeNull();
    });

    it('reads its texts from the prefix and the account from the address of the config', async () => {
        await render(buildProfile(), new PasswordChangeConfig({ baseUrl: '/me', prefix: 'my-app.password' }));

        expect(text()).toContain('my-app.password.title');
        expect(queryControl(fixture, 'my-app.password.password.current-password.label')).not.toBeNull();
    });
});
