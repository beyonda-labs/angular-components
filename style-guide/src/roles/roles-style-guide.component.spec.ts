import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { RolesStyleGuideComponent } from './roles-style-guide.component';

const ROLES_URL = 'https://api.test/api/style-guide/roles';

describe('RolesStyleGuideComponent', () => {
    let fixture: ComponentFixture<RolesStyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RolesStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(RolesStyleGuideComponent);
        httpTesting.expectOne(`${ROLES_URL}/permissions`).flush({ permissions: [] });
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the roles of the demo backend', async () => {
        httpTesting
            .expectOne(request => request.url === ROLES_URL)
            .flush({
                globalActions: [],
                results: [
                    { actions: [], id: 'normaluser', isBase: true, memberCount: 3, name: 'normaluser', permissions: [] }
                ]
            });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('normaluser');
    });

    it('shows an empty page when the demo backend serves no roles', async () => {
        httpTesting
            .expectOne(request => request.url === ROLES_URL)
            .flush(null, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('angular-components.roles.table.empty');
    });
});
