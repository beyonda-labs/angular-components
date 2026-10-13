import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { OrganizationsStyleGuideComponent } from './organizations-style-guide.component';

const ORGANIZATIONS_URL = 'https://api.test/api/style-guide/organizations';

describe('OrganizationsStyleGuideComponent', () => {
    let fixture: ComponentFixture<OrganizationsStyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationsStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(OrganizationsStyleGuideComponent);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the organizations of the demo backend', async () => {
        httpTesting
            .expectOne(request => request.url === ORGANIZATIONS_URL)
            .flush({
                globalActions: [],
                results: [{ actions: [], createdAt: 0, id: 'o1', name: 'Acme', status: 'active', userCount: 3 }]
            });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('Acme');
    });

    it('shows an empty page when the demo backend serves no organizations', async () => {
        httpTesting
            .expectOne(request => request.url === ORGANIZATIONS_URL)
            .flush(null, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('angular-components.organizations.table.empty');
    });
});
