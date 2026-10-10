import { HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
import { FakeToastService } from '@testing/services/fake-toast.service';

import { AccountProfile } from '../../services/account/models/account.model';
import { SessionService } from '../../services/session/session.service';
import { PasswordChangeConfig } from '../password-change/models/password-change.model';
import { PasswordChangeComponent } from '../password-change/password-change.component';
import { AccountDataComponent } from './account-data.component';
import { AccountDataConfig, AccountDataConfigParameters } from './models/account-data.model';
import { AccountDataField, AccountDataFieldKey } from './models/account-data-field.model';

const ACCOUNT_URL = 'https://api.test/api/account';
const PREFIX = 'angular-components.account-data';
const NAME = `${PREFIX}.profile.name.label`;
const SURNAME = `${PREFIX}.profile.surname.label`;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AccountDataComponent, PasswordChangeComponent],
    standalone: true,
    template: `
        <bey-account-data [config]="accountDataConfig"></bey-account-data>
        <bey-password-change [config]="passwordChangeConfig"></bey-password-change>
    `
})
class AccountPageHostComponent {
    readonly accountDataConfig = new AccountDataConfig();
    readonly passwordChangeConfig = new PasswordChangeConfig();
}

describe('AccountDataComponent', () => {
    let fixture: ComponentFixture<unknown>;
    let httpTesting: HttpTestingController;

    function buildConfig(overrides: AccountDataConfigParameters = {}): AccountDataConfig {
        return new AccountDataConfig(overrides);
    }

    function buildProfile(overrides: Partial<AccountProfile> = {}): AccountProfile {
        return {
            email: 'ada@example.test',
            hasPassword: true,
            id: 'u1',
            name: 'Ada',
            roles: ['editor'],
            surname: 'Lovelace',
            ...overrides
        };
    }

    async function render(config = buildConfig(), profile = buildProfile()): Promise<void> {
        fixture = await renderComponent(AccountDataComponent, { config });
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

    function saveButton(): HTMLButtonElement {
        return buttonByName(fixture, `${PREFIX}.save`);
    }

    function text(): string {
        return (fixture.nativeElement as HTMLElement).textContent ?? '';
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccountDataComponent, AccountPageHostComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    user: {
                        allowedPaths: ['/account'],
                        email: 'ada@example.test',
                        name: 'Ada',
                        redirectPath: '/account'
                    }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('shows its title, the email of the account read-only, and its name and surname ready to change', async () => {
        await render();

        expect(text()).toContain(`${PREFIX}.title`);
        expect(text()).toContain(`${PREFIX}.description`);
        expect(text()).toContain('ada@example.test');
        expect(queryControl(fixture, `${PREFIX}.profile.email.label`)).toBeNull();
        expect(controlByName(fixture, NAME).value).toBe('Ada');
        expect(controlByName(fixture, SURNAME).value).toBe('Lovelace');
    });

    it('tells under the email that it is the one to sign in with, and gives the names no hint', async () => {
        await render();
        const [email] = queryAll(fixture, '[aria-describedby]');

        expect(email.textContent).toContain('ada@example.test');
        expect(accessibleDescription(email)).toBe(`${PREFIX}.profile.email.hint`);
        expect(accessibleDescription(controlByName(fixture, NAME))).toBe('');
        expect(accessibleDescription(controlByName(fixture, SURNAME))).toBe('');
    });

    it('shows the hint a field of the config gives instead, or none', async () => {
        await render(
            buildConfig({
                fields: [
                    new AccountDataField({ hint: '', key: AccountDataFieldKey.Email }),
                    new AccountDataField({ hint: 'my-app.account.name-hint', key: AccountDataFieldKey.Name })
                ]
            })
        );

        expect(text()).not.toContain(`${PREFIX}.profile.email.hint`);
        expect(accessibleDescription(controlByName(fixture, NAME))).toBe('my-app.account.name-hint');
    });

    it('enables its single button only once there is a valid change', async () => {
        await render(
            buildConfig({
                fields: [
                    new AccountDataField({ isRequired: true, key: AccountDataFieldKey.Name }),
                    new AccountDataField({ key: AccountDataFieldKey.Surname })
                ]
            })
        );

        expect(saveButton().disabled).toBe(true);

        await type(NAME, '');
        expect(saveButton().disabled).toBe(true);

        await type(NAME, 'Augusta');
        expect(saveButton().disabled).toBe(false);
    });

    it('saves the name and the surname, confirms it, and puts them on the signed-in user', async () => {
        await render();

        await type(NAME, ' Augusta ');
        saveButton().click();
        const request = httpTesting.expectOne(ACCOUNT_URL);
        request.flush(buildProfile({ name: 'Augusta' }));
        await settle(fixture);

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Augusta', surname: 'Lovelace' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.success` }]);
        expect(TestBed.inject(SessionService).user()).toEqual(
            expect.objectContaining({ email: 'ada@example.test', name: 'Augusta', surname: 'Lovelace' })
        );
        expect(controlByName(fixture, NAME).value).toBe('Augusta');
    });

    it('shows only the fields of the config and sends only the editable ones among them', async () => {
        await render(
            buildConfig({
                fields: [
                    new AccountDataField({ key: AccountDataFieldKey.Name }),
                    new AccountDataField({ key: AccountDataFieldKey.Email })
                ]
            })
        );

        expect(text()).toContain('ada@example.test');
        expect(queryControl(fixture, SURNAME)).toBeNull();

        await type(NAME, 'Augusta');
        saveButton().click();
        const request = httpTesting.expectOne(ACCOUNT_URL);
        request.flush(buildProfile({ name: 'Augusta' }));

        expect(request.request.body).toEqual({ name: 'Augusta' });
    });

    it('reads its texts from the prefix and the account from the address of the config', async () => {
        await render(buildConfig({ baseUrl: '/me', prefix: 'my-app.account-data' }));

        expect(text()).toContain('my-app.account-data.title');
        expect(controlByName(fixture, 'my-app.account-data.profile.name.label').value).toBe('Ada');
    });

    it('asks for the account again on every new visit, so another user never sees the previous profile', async () => {
        await render();
        fixture.destroy();

        fixture = await renderComponent(AccountDataComponent, { config: buildConfig() });

        expect(text()).not.toContain('ada@example.test');

        httpTesting.expectOne(ACCOUNT_URL).flush(buildProfile({ email: 'grace@example.test', name: 'Grace' }));
        await settle(fixture);

        expect(text()).toContain('grace@example.test');
        expect(controlByName(fixture, NAME).value).toBe('Grace');
    });

    it('shares a single request for the account with the password change on the same page', async () => {
        fixture = await renderComponent(AccountPageHostComponent);
        httpTesting.expectOne(ACCOUNT_URL).flush(buildProfile());
        await settle(fixture);

        expect(controlByName(fixture, NAME).value).toBe('Ada');
        expect(
            queryControl(fixture, 'angular-components.password-change.password.current-password.label')
        ).not.toBeNull();
    });
});
