import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionService } from '../../../services/session/session.service';
import { LoginSessionService } from './login-session.service';

describe('LoginSessionService', () => {
    let service: LoginSessionService;
    let session: SessionService;
    let navigate: jest.SpyInstance;

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        service = TestBed.inject(LoginSessionService);
        session = TestBed.inject(SessionService);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('keeps the access token and goes where the user is allowed', () => {
        const accessToken = buildAccessToken(['/home']);

        service.open({ accessToken });

        expect(session.getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('goes to the root when the user carries no redirect path', () => {
        service.open({ accessToken: buildAccessToken([]) });

        expect(navigate).toHaveBeenCalledWith(['/']);
    });
});
