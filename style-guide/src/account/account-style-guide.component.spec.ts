import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AccountStyleGuideComponent } from './account-style-guide.component';

describe('AccountStyleGuideComponent', () => {
    it('shows the account the demo backend answers', async () => {
        await TestBed.configureTestingModule({
            imports: [AccountStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        const fixture = await renderComponent(AccountStyleGuideComponent);
        TestBed.inject(HttpTestingController)
            .expectOne('https://api.test/api/style-guide/account')
            .flush({ email: 'ada@example.test', hasPassword: false, id: 'u1', roles: [] });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('ada@example.test');
        expect(hostOf(fixture).textContent).toContain('angular-components.account.password.no-password');
    });
});
