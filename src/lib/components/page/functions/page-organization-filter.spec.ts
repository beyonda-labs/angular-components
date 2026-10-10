import { SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { TableColumn } from '../../table/models/table.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { pageOrganizationColumn } from './page-organization-column';
import {
    buildPageOrganizationField,
    hasOrganizationChoice,
    hasOrganizationFilter,
    readOrganizationsUrl
} from './page-organization-filter';

const ORGANIZATIONS = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];

describe('buildPageOrganizationField', () => {
    it('offers each organization by name, filtering the organization id with equals only', () => {
        expect(buildPageOrganizationField(ORGANIZATIONS)).toMatchObject({
            key: 'organizationId',
            label: 'angular-components.page.search.fields.organization-id',
            operators: [SearchFilterOperator.Equals],
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ],
            type: SearchFieldType.Select
        });
    });

    it('offers nothing with one organization or none, which is all a manager or a single organization sees', () => {
        expect(buildPageOrganizationField([ORGANIZATIONS[0]])).toBeNull();
        expect(buildPageOrganizationField([])).toBeNull();
    });
});

describe('hasOrganizationChoice', () => {
    it('tells whether there are two organizations or more to tell apart', () => {
        expect(hasOrganizationChoice(ORGANIZATIONS)).toBe(true);
        expect(hasOrganizationChoice([ORGANIZATIONS[0]])).toBe(false);
    });
});

describe('hasOrganizationFilter', () => {
    it('tells whether the filters already filter by organization', () => {
        expect(hasOrganizationFilter([new StringFilter({ field: 'organizationId', value: 'o1' })])).toBe(true);
        expect(hasOrganizationFilter([new StringFilter({ field: 'ownerId', value: 'u1' })])).toBe(false);
    });
});

describe('readOrganizationsUrl', () => {
    function buildTableConfig(
        columns: TableColumn[] = [new TableColumn({ key: 'name' })],
        isOrganizationFilterEnabled = false
    ): PageTableConfig {
        return new PageTableConfig({
            columns,
            loadRow: () => [],
            search: new PageTableSearchConfig({ fields: [], isOrganizationFilterEnabled })
        });
    }

    it('answers the address of the resource when its search asks for the organization filter', () => {
        expect(readOrganizationsUrl({ baseUrl: '/items', tableConfig: buildTableConfig(undefined, true) })).toBe(
            '/items'
        );
    });

    it('answers the address of the resource when its columns hold the organization column', () => {
        expect(
            readOrganizationsUrl({ baseUrl: '/items', tableConfig: buildTableConfig([pageOrganizationColumn()]) })
        ).toBe('/items');
    });

    it('answers nothing without the filter nor the column, without a table or without an address', () => {
        expect(readOrganizationsUrl({ baseUrl: '/items', tableConfig: buildTableConfig() })).toBeNull();
        expect(readOrganizationsUrl({ baseUrl: '/items' })).toBeNull();
        expect(readOrganizationsUrl({ tableConfig: buildTableConfig(undefined, true) })).toBeNull();
    });
});
