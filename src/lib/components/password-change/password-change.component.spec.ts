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
const PREFIX = 'angular-components.password-change';
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

    it('hints the minimum length under the new password and notes on its button that other devices sign out', async () => {
        await render();

        expect(accessibleDescription(controlByName(fixture, PASSWORD))).toBe(`${PREFIX}.password.password.hint`);
        expect(accessibleDescription(controlByName(fixture, CURRENT))).toBe('');
        expect(text()).toContain(`${PREFIX}.note`);
        expect(accessibleDescription(saveButton())).toBe(`${PREFIX}.note`);
    });

    it('enables its single button only once the three passwords are valid', async () => {
        await render();

        expect(saveButton().disabled).toBe(true);

        await type(CURRENT, 'old-secret');
        expect(saveButton().disabled).toBe(true);

        await type(PASSWORD, 'new-secret');
        await type(CONFIRMATION, 'new-secret');
        expect(saveButton().disabled).toBe(false);
    });

    it('holds back a new password shorter than 8 characters', async () => {
        await render();

        await fill('old-secret', 'seven77');
        expect(saveButton().disabled).toBe(true);
        expect(controlByName(fixture, PASSWORD).getAttribute('aria-invalid')).toBe('true');
        expect(accessibleDescription(controlByName(fixture, PASSWORD))).toBe(`${PREFIX}.password.password.hint`);

        await fill('old-secret', 'eight888');
        expect(saveButton().disabled).toBe(false);
    });

    it('holds the new password back while its confirmation does not match', async () => {
        await render();

        await fill('old-secret', 'new-secret', 'other-secret');

        expect(textsOf(queryAll(fixture, '[role="alert"]'))).toEqual([`${PREFIX}.password.password2.mismatch`]);
        expect(saveButton().disabled).toBe(true);
    });

    it('changes the password, confirms it, opens the session it answers and empties the form', async () => {
        await render();

        await fill('old-secret', 'new-secret');
        saveButton().click();
        const request = httpTesting.expectOne(PASSWORD_URL);
        request.flush({ accessToken: 'fresh-token' });
        await settle(fixture);

        expect(request.request.method).toBe('PUT');
        expect(request.request.withCredentials).toBe(true);
        expect(request.request.body).toEqual({
            currentPassword: 'old-secret',
            password: 'new-secret',
            password2: 'new-secret'
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
        expect(text()).not.toContain(`${PREFIX}.note`);
        expect(queryControl(fixture, CURRENT)).toBeNull();
    });

    it('reads its texts from the prefix and the account from the address of the config', async () => {
        await render(buildProfile(), new PasswordChangeConfig({ baseUrl: '/me', prefix: 'my-app.password' }));

        expect(text()).toContain('my-app.password.title');
        expect(queryControl(fixture, 'my-app.password.password.current-password.label')).not.toBeNull();
    });
});
