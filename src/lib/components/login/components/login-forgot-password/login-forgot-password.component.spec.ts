import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, controlByName, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { LoginConfig } from '../../models/login.model';
import { LoginForgotPasswordComponent } from './login-forgot-password.component';

const FORGOT_URL = 'https://api.test/auth/password/forgot';

describe('LoginForgotPasswordComponent', () => {
    let fixture: ComponentFixture<LoginForgotPasswordComponent>;
    let httpTesting: HttpTestingController;

    function status(): string {
        return fixture.nativeElement.querySelector('[role="status"]').textContent.trim();
    }

    async function send(email: string): Promise<void> {
        const input = controlByName(fixture, 'angular-components.login.forgot-password.email.label');

        input.value = email;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
        buttonByName(fixture, 'angular-components.login.forgot-password.button.send').click();
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginForgotPasswordComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(LoginForgotPasswordComponent, {
            config: new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product' })
        });
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('sends the typed email and confirms without telling whether the account exists', async () => {
        expect(fixture.nativeElement.textContent).toContain('angular-components.login.forgot-password.intro');
        expect(status()).toBe('');

        await send('ada@example.com');
        const request = httpTesting.expectOne({ method: 'POST', url: FORGOT_URL });
        request.flush(null, { status: 204, statusText: 'No Content' });
        await settle(fixture);

        expect(request.request.body).toEqual({ email: 'ada@example.com' });
        expect(status()).toBe('angular-components.login.forgot-password.sent');
    });

    it('confirms nothing when the request fails, and shows the reason in the error modal', async () => {
        await send('ada@example.com');
        httpTesting.expectOne(FORGOT_URL).flush(null, { status: 429, statusText: 'Too Many Requests' });
        await settle(fixture);

        expect(status()).toBe('');
        expect(TestBed.inject(FakeModalService).errors()).toHaveLength(1);
    });
});
