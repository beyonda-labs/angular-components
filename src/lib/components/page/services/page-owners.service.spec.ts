import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { StringFilter } from '../../search/models/search-filter.model';
import { PageConfig } from '../models/page.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { PageOwnersService } from './page-owners.service';

const OWNERS = [
    { id: 'u1', name: 'Ada' },
    { id: 'u2', name: 'Grace' }
];

describe('PageOwnersService', () => {
    let httpTesting: HttpTestingController;
    let service: PageOwnersService;

    function buildConfig(baseUrl = '/items', isOwnerFilterEnabled = true): PageConfig {
        return new PageConfig({
            baseUrl,
            prefix: 'demo',
            tableConfig: new PageTableConfig({
                columns: [],
                loadRow: () => [],
                search: new PageTableSearchConfig({ fields: [], isOwnerFilterEnabled })
            })
        });
    }

    function ownersRequests(baseUrl = '/items'): unknown[] {
        return httpTesting.match(`https://api.test/api${baseUrl}/owners`);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PageOwnersService, provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PageOwnersService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('knows no owners until they are asked for, and then those of the resource', () => {
        const config = buildConfig();
        expect(service.ownersOf(config)).toEqual([]);

        service.load(config);
        httpTesting.expectOne('https://api.test/api/items/owners').flush({ owners: OWNERS });

        expect(service.ownersOf(config)).toEqual(OWNERS);
    });

    it('asks once per resource, and only answers the owners of the resource it is asked about', () => {
        service.load(buildConfig());
        service.load(buildConfig());
        httpTesting.expectOne('https://api.test/api/items/owners').flush({ owners: OWNERS });

        service.load(buildConfig('/other'));
        httpTesting.expectOne('https://api.test/api/other/owners').flush({ owners: [OWNERS[0]] });

        expect(service.ownersOf(buildConfig())).toEqual([]);
        expect(service.ownersOf(buildConfig('/other'))).toEqual([OWNERS[0]]);
    });

    it('asks for nothing when the search of the page has no owner filter', () => {
        service.load(buildConfig('/items', false));

        expect(ownersRequests()).toEqual([]);
        expect(service.ownersOf(buildConfig('/items', false))).toEqual([]);
    });

    it('asks at once when the filters in force already filter by owner', () => {
        service.loadWhenFiltered(buildConfig(), [new StringFilter({ field: 'name', value: 'ada' })]);
        expect(ownersRequests()).toEqual([]);

        service.loadWhenFiltered(buildConfig(), [new StringFilter({ field: 'ownerId', value: 'u1' })]);
        httpTesting.expectOne('https://api.test/api/items/owners').flush({ owners: OWNERS });

        expect(service.ownersOf(buildConfig())).toEqual(OWNERS);
    });

    it('knows no owners, without an error modal nor a second request, when they cannot be read', () => {
        service.load(buildConfig());
        httpTesting
            .expectOne('https://api.test/api/items/owners')
            .flush(null, { status: 500, statusText: 'Server Error' });
        service.load(buildConfig());

        expect(service.ownersOf(buildConfig())).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
        expect(ownersRequests()).toEqual([]);
    });
});
