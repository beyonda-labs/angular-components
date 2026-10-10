import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { accessibleDescription, controlByName, hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PasswordChangeStyleGuideComponent } from './password-change-style-guide.component';

const PREFIX = 'angular-components.password-change';

describe('PasswordChangeStyleGuideComponent', () => {
    let fixture: ComponentFixture<PasswordChangeStyleGuideComponent>;

    async function render(hasPassword: boolean): Promise<void> {
        fixture = await renderComponent(PasswordChangeStyleGuideComponent);
        TestBed.inject(HttpTestingController)
            .expectOne('https://api.test/api/style-guide/account')
            .flush({ email: 'ada@example.test', hasPassword, id: 'u1', roles: [] });
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PasswordChangeStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();
    });

    it('shows how to set a password for the account the demo backend answers without one', async () => {
        await render(false);

        expect(hostOf(fixture).textContent).toContain(`${PREFIX}.no-password`);
    });

    it('asks an account with a password for the new one, with its hint', async () => {
        await render(true);

        expect(accessibleDescription(controlByName(fixture, `${PREFIX}.password.password.label`))).toBe(
            `${PREFIX}.password.password.hint`
        );
    });
});
