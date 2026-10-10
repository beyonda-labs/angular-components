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
        const response = { accessToken: 'a' };
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

    it('signs in and registers with the credentials, so the server can set its refresh cookie', () => {
        service.login({ email: 'ada@example.com', password: 'secret' }).subscribe();
        service.register({ name: 'Ada' }).subscribe();

        const login = httpTesting.expectOne('https://auth/login');
        const register = httpTesting.expectOne('https://auth/register');
        login.flush({ accessToken: 'a' });
        register.flush({ accessToken: 'a' });

        expect([login.request.withCredentials, register.request.withCredentials]).toEqual([true, true]);
    });

    it('asks for the emailed links behind the loading overlay', () => {
        const loading = TestBed.inject(LoadingService);
        const done = jest.fn();

        service.forgotPassword('ada@example.com').subscribe({ complete: done });
        service.resendVerification('ada@example.com').subscribe({ complete: done });

        expect(loading.isLoading()).toBe(true);

        const forgot = httpTesting.expectOne({ method: 'POST', url: 'https://auth/password/forgot' });
        const resend = httpTesting.expectOne({ method: 'POST', url: 'https://auth/verification/resend' });
        forgot.flush(null, { status: 204, statusText: 'No Content' });
        resend.flush(null, { status: 204, statusText: 'No Content' });

        expect([forgot.request.body, resend.request.body]).toEqual([
            { email: 'ada@example.com' },
            { email: 'ada@example.com' }
        ]);
        expect(done).toHaveBeenCalledTimes(2);
        expect(loading.isLoading()).toBe(false);
    });

    it('opens a session from an emailed link with the credentials, so the server can set its refresh cookie', () => {
        const response = { accessToken: 'a' };
        const received = jest.fn();

        service.resetPassword({ password: 'secret', password2: 'secret', token: 'reset' }).subscribe(received);
        service.verifyEmail('verify').subscribe(received);
        service
            .acceptInvitation({ name: 'Ada', password: 'secret', password2: 'secret', token: 'invite' })
            .subscribe(received);

        const requests = [
            httpTesting.expectOne({ method: 'POST', url: 'https://auth/password/reset' }),
            httpTesting.expectOne({ method: 'POST', url: 'https://auth/verification' }),
            httpTesting.expectOne({ method: 'POST', url: 'https://auth/invitation' })
        ];
        requests.forEach(request => request.flush(response));

        expect(requests.map(request => request.request.body)).toEqual([
            { password: 'secret', password2: 'secret', token: 'reset' },
            { token: 'verify' },
            { name: 'Ada', password: 'secret', password2: 'secret', token: 'invite' }
        ]);
        expect(requests.map(request => request.request.withCredentials)).toEqual([true, true, true]);
        expect(received).toHaveBeenCalledTimes(3);
    });

    it('reads the invitation of a token', () => {
        const invitation = { email: 'ada@example.com', name: 'Ada' };
        const received = jest.fn();

        service.getInvitation('invite').subscribe(received);
        httpTesting
            .expectOne(
                request => request.method === 'GET' && request.urlWithParams === 'https://auth/invitation?token=invite'
            )
            .flush(invitation);

        expect(received).toHaveBeenCalledWith(invitation);
    });
});
