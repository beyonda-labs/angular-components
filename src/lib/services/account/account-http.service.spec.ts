import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { AccountHttpService } from './account-http.service';

describe('AccountHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: AccountHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(AccountHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the account under the api', () => {
        service.load('/account').subscribe();

        expect(httpTesting.expectOne('https://api.test/api/account').request.method).toBe('GET');
    });

    it('puts the profile to the account and confirms it with the toast it is given', () => {
        service.updateProfile('/me', { name: 'Ada', surname: 'Lovelace' }, { successToast: 'saved' }).subscribe();
        const request = httpTesting.expectOne('https://api.test/api/me');
        request.flush({});

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Ada', surname: 'Lovelace' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'saved' }]);
    });

    it('lets the caller handle a failed profile instead of the error modal', () => {
        const handleError = jest.fn();

        service.updateProfile('/account', { theme: 'dark' }, { handleError }).subscribe({ error: jest.fn() });
        httpTesting.expectOne('https://api.test/api/account').flush(null, { status: 500, statusText: 'Error' });

        expect(handleError).toHaveBeenCalled();
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });

    it('puts the passwords to the password of the account, with the cookies', () => {
        const passwords = { currentPassword: 'old', password: 'new-secret', password2: 'new-secret' };

        service.changePassword('/account', passwords, { successToast: 'changed' }).subscribe();
        const { request } = httpTesting.expectOne('https://api.test/api/account/password');

        expect(request.method).toBe('PUT');
        expect(request.body).toEqual(passwords);
        expect(request.withCredentials).toBe(true);
    });
});
