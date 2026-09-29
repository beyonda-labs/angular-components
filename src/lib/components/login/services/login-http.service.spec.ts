import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { LoadingService } from '../../loading/services/loading.service';
import { LoginHttpService } from './login-http.service';

describe('LoginHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: LoginHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideBeyTesting({ environment: { accessControlUrl: 'https://auth' } })]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(LoginHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the providers and the register fields from the access control api, swallowing failures', () => {
        const failure = { status: 500, statusText: 'Server Error' };
        const received = jest.fn();

        service.getProviders().subscribe(received);
        service.getRegisterFields().subscribe(received);
        httpTesting.expectOne({ method: 'GET', url: 'https://auth/providers' }).flush(null, failure);
        httpTesting.expectOne({ method: 'GET', url: 'https://auth/register/fields' }).flush(null, failure);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        expect(received.mock.calls).toEqual([[[]], [[]]]);
    });

    it('signs in and registers behind the loading overlay', () => {
        const response = { accessToken: 'a', refreshToken: 'r' };
        const loading = TestBed.inject(LoadingService);
        const received = jest.fn();

        service.login({ email: 'ada@example.com', password: 'secret' }).subscribe(received);
        service.register({ name: 'Ada' }).subscribe();

        expect(loading.isLoading()).toBe(true);

        const login = httpTesting.expectOne({ method: 'POST', url: 'https://auth/login' });
        const register = httpTesting.expectOne({ method: 'POST', url: 'https://auth/register' });
        login.flush(response);
        register.flush(response);

        expect(login.request.body).toEqual({ email: 'ada@example.com', password: 'secret' });
        expect(register.request.body).toEqual({ name: 'Ada' });
        expect(received).toHaveBeenCalledWith(response);
        expect(loading.isLoading()).toBe(false);
    });
});
