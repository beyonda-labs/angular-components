import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PasswordChangeStyleGuideComponent } from './password-change-style-guide.component';

describe('PasswordChangeStyleGuideComponent', () => {
    it('shows how to set a password for the account the demo backend answers without one', async () => {
        await TestBed.configureTestingModule({
            imports: [PasswordChangeStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        const fixture = await renderComponent(PasswordChangeStyleGuideComponent);
        TestBed.inject(HttpTestingController)
            .expectOne('https://api.test/api/style-guide/account')
            .flush({ email: 'ada@example.test', hasPassword: false, id: 'u1', roles: [] });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('angular-components.password-change.no-password');
    });
});
