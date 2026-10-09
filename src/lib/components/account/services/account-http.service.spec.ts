import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

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

    it('puts the profile to the account', () => {
        service.updateProfile('/me', { name: 'Ada', surname: 'Lovelace' }, 'saved').subscribe();
        const { request } = httpTesting.expectOne('https://api.test/api/me');

        expect(request.method).toBe('PUT');
        expect(request.body).toEqual({ name: 'Ada', surname: 'Lovelace' });
    });

    it('puts the passwords to the password of the account, with the cookies', () => {
        const passwords = { currentPassword: 'old', password: 'new', password2: 'new' };

        service.changePassword('/account', passwords, 'changed').subscribe();
        const { request } = httpTesting.expectOne('https://api.test/api/account/password');

        expect(request.method).toBe('PUT');
        expect(request.body).toEqual(passwords);
        expect(request.withCredentials).toBe(true);
    });
});
