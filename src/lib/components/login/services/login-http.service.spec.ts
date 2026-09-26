import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { LoginHttpService } from './login-http.service';

describe('LoginHttpService', () => {
    let service: LoginHttpService;
    let httpService: MockProxy<HttpService>;

    beforeEach(() => {
        httpService = mock<HttpService>();

        TestBed.configureTestingModule({
            providers: [
                { provide: ENVIRONMENT_CONFIG, useValue: { accessControlUrl: 'https://auth' } as EnvironmentConfig },
                { provide: HttpService, useValue: httpService }
            ]
        });

        service = TestBed.inject(LoginHttpService);
    });

    it('reads the providers and the register fields from the access control api, swallowing failures', () => {
        httpService.get.mockReturnValue(of([]));

        service.getProviders();
        service.getRegisterFields();

        expect(httpService.get).toHaveBeenCalledWith('https://auth/providers', { handleError: expect.any(Function) });
        expect(httpService.get).toHaveBeenCalledWith('https://auth/register/fields', {
            handleError: expect.any(Function)
        });
    });

    it('signs in and registers behind the loading overlay', () => {
        const response = { accessToken: 'a', refreshToken: 'r' };
        httpService.post.mockReturnValue(of(response));
        const received = jest.fn();

        service.login({ email: 'ada@example.com', password: 'secret' }).subscribe(received);
        service.register({ name: 'Ada' });

        expect(httpService.post).toHaveBeenCalledWith(
            'https://auth/login',
            { email: 'ada@example.com', password: 'secret' },
            { loading: true }
        );
        expect(httpService.post).toHaveBeenCalledWith('https://auth/register', { name: 'Ada' }, { loading: true });
        expect(received).toHaveBeenCalledWith(response);
    });
});
