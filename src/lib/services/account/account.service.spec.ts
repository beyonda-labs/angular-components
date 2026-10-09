import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionService } from '../session/session.service';
import { AccountService } from './account.service';
import { AccountProfile } from './models/account.model';

const ACCOUNT_URL = 'https://api.test/api/account';
const PROFILE: AccountProfile = { email: 'ada@example.test', hasPassword: true, id: 'u1', roles: ['editor'] };

describe('AccountService', () => {
    let httpTesting: HttpTestingController;
    let service: AccountService;
    let session: SessionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
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
        service.load('/account');
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);

        expect(service.profile()).toEqual(PROFILE);
    });

    it('asks once for the profile while a request for it is on its way', () => {
        service.load('/account');
        service.load('/account');
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);

        expect(service.profile()).toEqual(PROFILE);
    });

    it('asks again on a later load, and forgets the previous profile until the new one answers', () => {
        service.load('/account');
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);

        service.load('/account');

        expect(service.profile()).toBeNull();

        httpTesting.expectOne(ACCOUNT_URL).flush({ ...PROFILE, email: 'grace@example.test', id: 'u2' });

        expect(service.profile()?.email).toBe('grace@example.test');
    });

    it('asks again once a failed load is over', () => {
        service.load('/account');
        httpTesting.expectOne(ACCOUNT_URL).flush(null, { status: 500, statusText: 'Error' });

        service.load('/account');
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);

        expect(service.profile()).toEqual(PROFILE);
    });

    it('saves the profile, keeps what the account answers and puts the names on the signed-in user', () => {
        service.saveProfile('/account', { name: 'Ada', surname: 'Lovelace' }, 'demo.saved');
        httpTesting.expectOne(ACCOUNT_URL).flush({ ...PROFILE, name: 'Ada', surname: 'Lovelace' });

        expect(service.profile()?.name).toBe('Ada');
        expect(session.user()).toEqual(expect.objectContaining({ name: 'Ada', surname: 'Lovelace' }));
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'demo.saved' }]);
    });

    it('changes the password, opens the session it answers and empties the form', () => {
        const form = { reset: jest.fn() };

        service.changePassword(
            '/account',
            { currentPassword: 'old', password: 'new-secret', password2: 'new-secret' },
            'demo.changed',
            form
        );
        httpTesting.expectOne(`${ACCOUNT_URL}/password`).flush({ accessToken: 'fresh-token' });

        expect(session.token()).toBe('fresh-token');
        expect(form.reset).toHaveBeenCalled();
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'demo.changed' }]);
    });

    it('keeps the session and the form as they are when the current password is wrong', () => {
        const form = { reset: jest.fn() };

        service.changePassword(
            '/account',
            { currentPassword: 'bad', password: 'new-secret', password2: 'new-secret' },
            'demo.changed',
            form
        );
        httpTesting
            .expectOne(`${ACCOUNT_URL}/password`)
            .flush(
                { errorCode: 'bad-request', messageKey: 'account.wrong-password' },
                { status: 400, statusText: 'Bad' }
            );

        expect(session.token()).toBe('test-token');
        expect(form.reset).not.toHaveBeenCalled();
    });
});
