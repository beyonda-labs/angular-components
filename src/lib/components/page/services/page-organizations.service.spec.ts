import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { StringFilter } from '../../search/models/search-filter.model';
import { TableColumn } from '../../table/models/table.model';
import { pageOrganizationColumn } from '../functions/page-organization-column';
import { PageConfig } from '../models/page.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { PageOrganizationsService } from './page-organizations.service';

const ORGANIZATIONS = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];

describe('PageOrganizationsService', () => {
    let httpTesting: HttpTestingController;
    let service: PageOrganizationsService;

    function buildConfig({
        baseUrl = '/items',
        hasColumn = false,
        isOrganizationFilterEnabled = true
    }: { baseUrl?: string; hasColumn?: boolean; isOrganizationFilterEnabled?: boolean } = {}): PageConfig {
        return new PageConfig({
            baseUrl,
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                columns: [new TableColumn({ key: 'name' }), ...(hasColumn ? [pageOrganizationColumn()] : [])],
                loadRow: () => [],
                search: new PageTableSearchConfig({ fields: [], isOrganizationFilterEnabled })
            })
        });
    }

    function organizationsRequests(baseUrl = '/items'): unknown[] {
        return httpTesting.match(`https://api.test/api${baseUrl}/organizations`);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PageOrganizationsService, provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PageOrganizationsService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('knows no organizations until they are asked for, and then those of the resource', () => {
        const config = buildConfig();
        expect(service.organizationsOf(config)).toEqual([]);

        service.load(config);
        httpTesting.expectOne('https://api.test/api/items/organizations').flush({ organizations: ORGANIZATIONS });

        expect(service.organizationsOf(config)).toEqual(ORGANIZATIONS);
    });

    it('asks once per resource, and only answers the organizations of the resource it is asked about', () => {
        service.load(buildConfig());
        service.load(buildConfig());
        httpTesting.expectOne('https://api.test/api/items/organizations').flush({ organizations: ORGANIZATIONS });

        service.load(buildConfig({ baseUrl: '/other' }));
        httpTesting.expectOne('https://api.test/api/other/organizations').flush({ organizations: [ORGANIZATIONS[0]] });

        expect(service.organizationsOf(buildConfig())).toEqual([]);
        expect(service.organizationsOf(buildConfig({ baseUrl: '/other' }))).toEqual([ORGANIZATIONS[0]]);
    });

    it('asks for nothing when the page has neither the organization filter nor the column', () => {
        const config = buildConfig({ isOrganizationFilterEnabled: false });

        service.load(config);
        service.loadForPage(config, [new StringFilter({ field: 'organizationId', value: 'o1' })]);

        expect(organizationsRequests()).toEqual([]);
        expect(service.organizationsOf(config)).toEqual([]);
    });

    it('asks at once for a page that shows the organization column', () => {
        service.loadForPage(buildConfig(), []);
        expect(organizationsRequests()).toEqual([]);

        service.loadForPage(buildConfig({ hasColumn: true, isOrganizationFilterEnabled: false }), []);
        httpTesting.expectOne('https://api.test/api/items/organizations').flush({ organizations: ORGANIZATIONS });

        expect(service.organizationsOf(buildConfig({ hasColumn: true }))).toEqual(ORGANIZATIONS);
    });

    it('asks at once when the filters in force already filter by organization', () => {
        service.loadForPage(buildConfig(), [new StringFilter({ field: 'name', value: 'acme' })]);
        expect(organizationsRequests()).toEqual([]);

        service.loadForPage(buildConfig(), [new StringFilter({ field: 'organizationId', value: 'o1' })]);
        httpTesting.expectOne('https://api.test/api/items/organizations').flush({ organizations: ORGANIZATIONS });

        expect(service.organizationsOf(buildConfig())).toEqual(ORGANIZATIONS);
    });

    it('leaves the entry of the organization column out until the organizations are two or more', () => {
        const config = buildConfig({ hasColumn: true });
        const cells = ['name', 'organization'];

        expect(service.withoutHidden(config, cells)).toEqual(['name']);

        service.load(config);
        httpTesting.expectOne('https://api.test/api/items/organizations').flush({ organizations: ORGANIZATIONS });

        expect(service.withoutHidden(config, cells)).toEqual(cells);
    });

    it('knows no organizations, without an error modal nor a second request, when they cannot be read', () => {
        service.load(buildConfig());
        httpTesting
            .expectOne('https://api.test/api/items/organizations')
            .flush(null, { status: 404, statusText: 'Not Found' });
        service.load(buildConfig());

        expect(service.organizationsOf(buildConfig())).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        expect(organizationsRequests()).toEqual([]);
    });
});
