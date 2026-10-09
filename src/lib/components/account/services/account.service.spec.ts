import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionService } from '../../../services/session/session.service';
import { FormHandle } from '../../form/models/form.model';
import { AccountConfig, AccountPasswordFormValue, AccountProfile } from '../models/account.model';
import { AccountService } from './account.service';

const PROFILE: AccountProfile = { email: 'ada@example.test', hasPassword: true, id: 'u1', roles: ['editor'] };

describe('AccountService', () => {
    let httpTesting: HttpTestingController;
    let service: AccountService;
    let session: SessionService;

    const config = new AccountConfig({ prefix: 'demo.account' });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AccountService,
                provideRouter([]),
                provideBeyTesting({
                    user: { allowedPaths: ['/home'], email: 'ada@example.test', redirectPath: '/home' }
                })
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(AccountService);
        session = TestBed.inject(SessionService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('loads the profile of the account', () => {
        service.load(config);
        httpTesting.expectOne('https://api.test/api/account').flush(PROFILE);

        expect(service.profile()).toEqual(PROFILE);
    });

    it('saves the profile, keeps what the account answers and puts the names on the signed-in user', () => {
        service.saveProfile(config, { name: 'Ada', surname: 'Lovelace' });
        httpTesting.expectOne('https://api.test/api/account').flush({ ...PROFILE, name: 'Ada', surname: 'Lovelace' });

        expect(service.profile()?.name).toBe('Ada');
        expect(session.user()).toEqual(expect.objectContaining({ name: 'Ada', surname: 'Lovelace' }));
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'demo.account.toast.profile-success' }
        ]);
    });

    it('changes the password, opens the session it answers and empties the form', () => {
        const handle = { reset: jest.fn() } as unknown as FormHandle<AccountPasswordFormValue>;

        service.changePassword(config, { currentPassword: 'old', password: 'new', password2: 'new' }, handle);
        httpTesting.expectOne('https://api.test/api/account/password').flush({ accessToken: 'fresh-token' });

        expect(session.token()).toBe('fresh-token');
        expect(handle.reset).toHaveBeenCalled();
    });

    it('keeps the form as it is when the current password is wrong', () => {
        const handle = { reset: jest.fn() } as unknown as FormHandle<AccountPasswordFormValue>;

        service.changePassword(config, { currentPassword: 'bad', password: 'new', password2: 'new' }, handle);
        httpTesting
            .expectOne('https://api.test/api/account/password')
            .flush(
                { errorCode: 'bad-request', messageKey: 'account.wrong-password' },
                { status: 400, statusText: 'Bad' }
            );

        expect(session.token()).toBe('test-token');
        expect(handle.reset).not.toHaveBeenCalled();
    });
});
