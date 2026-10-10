import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { buttonByName, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionService } from '../../../../services/session/session.service';
import { LoginConfig } from '../../models/login.model';
import { LoginVerifyEmailComponent } from './login-verify-email.component';

const TOKEN_QUERY = { token: 'verify-token' };
const VERIFY_URL = 'https://api.test/auth/verification';

describe('LoginVerifyEmailComponent', () => {
    let fixture: ComponentFixture<LoginVerifyEmailComponent>;
    let httpTesting: HttpTestingController;
    let navigate: jest.SpyInstance;

    function buildAccessToken(allowedPaths: string[]): string {
        return `header.${btoa(JSON.stringify({ allowedPaths, email: 'ada@example.com' }))}.signature`;
    }

    async function land(query: Record<string, string> = TOKEN_QUERY): Promise<void> {
        await TestBed.configureTestingModule({
            imports: [LoginVerifyEmailComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting(),
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        fixture = await renderComponent(LoginVerifyEmailComponent, {
            config: new LoginConfig({
                iconSrc: 'logo.svg',
                productDescription: 'demo.pitch',
                productName: 'demo.product'
            })
        });
    }

    function status(): string {
        return fixture.nativeElement.querySelector('[role="status"]').textContent.trim();
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    afterEach(() => {
        httpTesting.verify();
    });

    it('verifies the token of the link on load, shows the progress and opens the session', async () => {
        const accessToken = buildAccessToken(['/home']);
        await land();

        expect(text()).toContain('angular-components.login.title.verify-email');
        expect(status()).toBe('angular-components.login.verify-email.progress');

        const request = httpTesting.expectOne({ method: 'POST', url: VERIFY_URL });
        request.flush({ accessToken });
        await settle(fixture);

        expect(request.request.body).toEqual({ token: 'verify-token' });
        expect(status()).toBe('angular-components.login.verify-email.success');
        expect(TestBed.inject(SessionService).getToken()).toBe(accessToken);
        expect(navigate).toHaveBeenCalledWith(['/home']);
    });

    it('explains a link without token without asking the server', async () => {
        await land({});

        httpTesting.expectNone(VERIFY_URL);
        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(text()).toContain('angular-components.login.verify-email.invalid-hint');
    });

    it('explains a token the server refuses', async () => {
        await land();

        httpTesting
            .expectOne(VERIFY_URL)
            .flush(
                { errorCode: 'bad-request', messageKey: 'account.token-invalid' },
                { status: 400, statusText: 'Bad Request' }
            );
        await settle(fixture);

        expect(status()).toBe('');
        expect(text()).toContain('angular-components.login.title.invalid-link');
        expect(text()).toContain('angular-components.login.link-error.invalid');
        expect(navigate).not.toHaveBeenCalled();
    });

    it('offers to try again after another failure', async () => {
        const accessToken = buildAccessToken(['/home']);
        await land();

        httpTesting.expectOne(VERIFY_URL).flush(null, { status: 503, statusText: 'Service Unavailable' });
        await settle(fixture);

        expect(text()).toContain('angular-components.login.link-error.failed');

        buttonByName(fixture, 'angular-components.login.link-error.retry').click();
        await settle(fixture);
        httpTesting.expectOne(VERIFY_URL).flush({ accessToken });

        expect(navigate).toHaveBeenCalledWith(['/home']);
    });
});
