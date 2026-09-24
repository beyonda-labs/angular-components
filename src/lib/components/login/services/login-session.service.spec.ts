import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { mock, MockProxy } from 'jest-mock-extended';

import { SessionUser } from '../../../services/session/models/session.model';
import { SessionService } from '../../../services/session/session.service';
import { LoginSessionService } from './login-session.service';

describe('LoginSessionService', () => {
    let service: LoginSessionService;
    let sessionService: MockProxy<SessionService>;
    let navigate: jest.SpyInstance;

    beforeEach(() => {
        sessionService = mock<SessionService>();

        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: SessionService, useValue: sessionService }]
        });

        service = TestBed.inject(LoginSessionService);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('stores both tokens and goes where the user is allowed', () => {
        sessionService.user.mockReturnValue({ redirectPath: '/home' } as SessionUser);

        service.open({ accessToken: 'access', refreshToken: 'refresh' });

        expect(sessionService.setToken).toHaveBeenCalledWith('access');
        expect(sessionService.setRefreshToken).toHaveBeenCalledWith('refresh');
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('goes to the root when the user carries no redirect path', () => {
        sessionService.user.mockReturnValue({ redirectPath: '' } as SessionUser);

        service.open({ accessToken: 'access', refreshToken: 'refresh' });

        expect(navigate).toHaveBeenCalledWith(['/']);
    });
});
