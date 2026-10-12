import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { GroupsStyleGuideComponent } from './groups-style-guide.component';

const GROUPS_URL = 'https://api.test/api/style-guide/groups';

describe('GroupsStyleGuideComponent', () => {
    let fixture: ComponentFixture<GroupsStyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GroupsStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(GroupsStyleGuideComponent);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the groups of the demo backend', async () => {
        httpTesting
            .expectOne(request => request.url === GROUPS_URL)
            .flush({
                globalActions: ['create'],
                results: [{ actions: ['edit'], createdAt: 0, id: 'g1', memberCount: 3, name: 'Sales' }]
            });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('Sales');
    });

    it('shows an empty page when the demo backend serves no groups', async () => {
        httpTesting
            .expectOne(request => request.url === GROUPS_URL)
            .flush(null, { status: 404, statusText: 'Not Found' });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('angular-components.groups.table.empty');
    });
});
