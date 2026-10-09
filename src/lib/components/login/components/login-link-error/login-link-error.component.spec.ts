import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AccountLinkFlow, LinkErrorReason, LoginConfig } from '../../models/login.model';
import { LoginLinkErrorComponent } from './login-link-error.component';

const BACK_TO_SIGN_IN = 'angular-components.login.back-to-sign-in';
const NEW_LINK = 'angular-components.login.link-error.request-new-link';
const RETRY = 'angular-components.login.link-error.retry';

describe('LoginLinkErrorComponent', () => {
    let fixture: ComponentFixture<LoginLinkErrorComponent>;

    async function render(flow: AccountLinkFlow, reason: LinkErrorReason): Promise<void> {
        fixture = await renderComponent(LoginLinkErrorComponent, {
            config: new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product' }),
            flow,
            reason
        });
    }

    function link(name: string): HTMLAnchorElement | null {
        return queryAll<HTMLAnchorElement>(fixture, 'a').find(anchor => anchor.textContent?.trim() === name) ?? null;
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginLinkErrorComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();
    });

    it('explains an invalid reset link and links to a new one and back to sign in', async () => {
        await render('reset-password', 'invalid');

        expect(text()).toContain('angular-components.login.link-error.invalid');
        expect(text()).toContain('angular-components.login.reset-password.invalid-hint');
        expect(link(NEW_LINK)?.getAttribute('href')).toBe('/login?view=forgot-password');
        expect(link(BACK_TO_SIGN_IN)?.getAttribute('href')).toBe('/login');
        expect(queryButton(fixture, RETRY)).toBeNull();
    });

    it('gives the hint of its flow and no new reset link outside the reset flow', async () => {
        await render('accept-invitation', 'invalid');

        expect(text()).toContain('angular-components.login.accept-invitation.invalid-hint');
        expect(link(NEW_LINK)).toBeNull();
        expect(link(BACK_TO_SIGN_IN)).not.toBeNull();
    });

    it('offers to try again after a failure and reports the click', async () => {
        const retryClick = jest.fn();
        await render('verify-email', 'failed');
        fixture.componentInstance.retryClick.subscribe(retryClick);

        buttonByName(fixture, RETRY).click();

        expect(text()).toContain('angular-components.login.link-error.failed');
        expect(text()).not.toContain('angular-components.login.verify-email.invalid-hint');
        expect(retryClick).toHaveBeenCalled();
    });
});
