import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, controlByName, queryAll, queryControl, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionService } from '../../services/session/session.service';
import { AccountComponent } from './account.component';
import { AccountConfig, AccountProfile } from './models/account.model';

const ACCOUNT_URL = 'https://api.test/api/account';
const PREFIX = 'angular-components.account';

describe('AccountComponent', () => {
    let fixture: ComponentFixture<AccountComponent>;
    let httpTesting: HttpTestingController;

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

    async function render(profile: AccountProfile = buildProfile(), config = new AccountConfig()): Promise<void> {
        fixture = await renderComponent(AccountComponent, { config });
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

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccountComponent],
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

    it('shows the email of the account read-only, and its name and surname ready to change', async () => {
        await render();

        expect(text()).toContain(`${PREFIX}.title`);
        expect(text()).toContain('ada@example.test');
        expect(queryControl(fixture, `${PREFIX}.profile.email.label`)).toBeNull();
        expect(controlByName(fixture, `${PREFIX}.profile.name.label`).value).toBe('Ada');
        expect(controlByName(fixture, `${PREFIX}.profile.surname.label`).value).toBe('Lovelace');
    });

    it('saves the name and the surname, confirms it, and puts them on the signed-in user', async () => {
        await render();

        await type(`${PREFIX}.profile.name.label`, ' Augusta ');
        buttonByName(fixture, `${PREFIX}.profile.save`).click();
        const request = httpTesting.expectOne(ACCOUNT_URL);
        request.flush(buildProfile({ name: 'Augusta' }));
        await settle(fixture);

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Augusta', surname: 'Lovelace' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.profile-success` }]);
        expect(TestBed.inject(SessionService).user()).toEqual(
            expect.objectContaining({ email: 'ada@example.test', name: 'Augusta', surname: 'Lovelace' })
        );
        expect(controlByName(fixture, `${PREFIX}.profile.name.label`).value).toBe('Augusta');
    });

    it('changes the password, confirms it and opens the session it answers', async () => {
        await render();

        await type(`${PREFIX}.password.current-password.label`, 'old-secret');
        await type(`${PREFIX}.password.password.label`, 'new-secret');
        await type(`${PREFIX}.password.password2.label`, 'new-secret');
        buttonByName(fixture, `${PREFIX}.password.save`).click();
        const request = httpTesting.expectOne(`${ACCOUNT_URL}/password`);
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
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.password-success` }]);
        expect(controlByName(fixture, `${PREFIX}.password.current-password.label`).value).toBe('');
    });

    it('holds the new password back while its confirmation does not match', async () => {
        await render();

        await type(`${PREFIX}.password.current-password.label`, 'old-secret');
        await type(`${PREFIX}.password.password.label`, 'new-secret');
        await type(`${PREFIX}.password.password2.label`, 'other-secret');

        expect(textsOf(queryAll(fixture, '[role="alert"]'))).toEqual([`${PREFIX}.password.password2.mismatch`]);
        expect(buttonByName(fixture, `${PREFIX}.password.save`).disabled).toBe(true);
    });

    it('tells a user without a password how to set one, instead of asking for the current one', async () => {
        await render(buildProfile({ hasPassword: false }));

        expect(text()).toContain(`${PREFIX}.password.no-password`);
        expect(queryControl(fixture, `${PREFIX}.password.current-password.label`)).toBeNull();
    });

    it('reads its texts from the prefix and the account from the address of the config', async () => {
        await render(buildProfile(), new AccountConfig({ baseUrl: '/me', prefix: 'my-app.account' }));

        expect(text()).toContain('my-app.account.profile.title');
        expect(controlByName(fixture, 'my-app.account.profile.name.label').value).toBe('Ada');
    });
});
