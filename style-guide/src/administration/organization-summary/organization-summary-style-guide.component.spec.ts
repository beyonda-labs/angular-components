import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { OrganizationSummaryStyleGuideComponent } from './organization-summary-style-guide.component';

describe('OrganizationSummaryStyleGuideComponent', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationSummaryStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('shows the organization the demo backend answers', async () => {
        const fixture = await renderComponent(OrganizationSummaryStyleGuideComponent);
        httpTesting.expectOne('https://api.test/api/style-guide/organizations/current').flush({
            administrators: [],
            counts: { extraRoles: 1, groups: 2, members: 5 },
            createdAt: 0,
            extraRoles: [{ description: 'Review the templates', id: 'r1', name: 'Reviewers' }],
            groups: [
                {
                    id: 'g1',
                    memberCount: 1,
                    members: [{ email: 'ada@example.test', id: 'u1', name: 'Ada' }],
                    name: 'Sales'
                },
                { id: 'g2', memberCount: 0, members: [], name: 'Support' }
            ],
            id: 'o1',
            name: 'Acme',
            status: 'active',
            ungroupedMembers: []
        });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('Acme');
        expect(hostOf(fixture).textContent).toContain('Sales');
        expect(hostOf(fixture).textContent).toContain('Review the templates');
    });
});
