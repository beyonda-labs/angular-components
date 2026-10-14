import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { renderComponent, settle, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { administrationStyleGuideInterceptor } from '../functions/administration-backend';
import { OrganizationSummaryStyleGuideComponent } from './organization-summary-style-guide.component';

describe('OrganizationSummaryStyleGuideComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationSummaryStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting({ interceptors: [administrationStyleGuideInterceptor] })]
        }).compileComponents();
    });

    afterEach(() => {
        TestBed.inject(HttpTestingController).verify();
    });

    it('shows the organization the demo fakes, its administrators, groups and additional roles', async () => {
        const fixture = await renderComponent(OrganizationSummaryStyleGuideComponent);
        await settle(fixture);

        const text = visibleText(fixture);

        expect(text).toContain('Acme');
        expect(text).toContain('Ada Lovelace');
        expect(text).toContain('Sales');
        expect(text).toContain('Reviewers');
        expect(text).toContain('Publish the templates the editors prepare.');
    });
});
