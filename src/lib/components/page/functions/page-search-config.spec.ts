import { SearchField, SearchFieldType } from '../../search/models/search.model';
import { StringFilter } from '../../search/models/search-filter.model';
import { PageSearchConfigOptions } from '../models/page-search.model';
import { PageTableConfig, PageTableSearchConfig, PageTableSearchConfigParameters } from '../models/page-table.model';
import { buildPageSearchConfig } from './page-search-config';

describe('buildPageSearchConfig', () => {
    const name = new SearchField({ key: 'name', type: SearchFieldType.Text });
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];
    const owners = [
        { id: 'u1', name: 'Ada' },
        { id: 'u2', name: 'Grace' }
    ];

    function buildOptions(overrides: Partial<PageSearchConfigOptions> = {}): PageSearchConfigOptions {
        return {
            filters: [],
            onFiltersChange: jest.fn(),
            onPanelOpen: jest.fn(),
            organizations,
            owners,
            ...overrides
        };
    }

    function buildTableConfig(overrides: Partial<PageTableSearchConfigParameters> = {}): PageTableConfig {
        return new PageTableConfig({
            columns: [],
            loadRow: () => [],
            search: new PageTableSearchConfig({ fields: [name], mainField: 'name', ...overrides })
        });
    }

    it('builds the search of the page from its fields, its filters and its prefix', () => {
        const filters = [new StringFilter({ field: 'name', value: 'ada' })];
        const options = buildOptions({ filters });
        const search = buildPageSearchConfig({ prefix: 'demo', tableConfig: buildTableConfig() }, options);

        expect(search).toMatchObject({ fields: [name], filters, mainField: 'name', prefix: 'demo.search' });
        expect(search?.onFiltersChange).toBe(options.onFiltersChange);
        expect(search?.onPanelOpen).toBeUndefined();
    });

    it('adds the owner filter after the fields of the page, and asks for the owners when the panel opens', () => {
        const options = buildOptions();
        const search = buildPageSearchConfig(
            { prefix: 'demo', tableConfig: buildTableConfig({ isOwnerFilterEnabled: true }) },
            options
        );

        expect(search?.fields.map(field => field.key)).toEqual(['name', 'ownerId']);
        expect(search?.onPanelOpen).toBe(options.onPanelOpen);
    });

    it('leaves the owner filter out until there are two owners to choose from', () => {
        const search = buildPageSearchConfig(
            { prefix: 'demo', tableConfig: buildTableConfig({ isOwnerFilterEnabled: true }) },
            buildOptions({ owners: [owners[0]] })
        );

        expect(search?.fields).toEqual([name]);
    });

    it('adds the organization filter before the owner filter, and asks for the organizations when the panel opens', () => {
        const options = buildOptions();
        const search = buildPageSearchConfig(
            {
                prefix: 'demo',
                tableConfig: buildTableConfig({ isOrganizationFilterEnabled: true, isOwnerFilterEnabled: true })
            },
            options
        );

        expect(search?.fields.map(field => field.key)).toEqual(['name', 'organizationId', 'ownerId']);
        expect(search?.onPanelOpen).toBe(options.onPanelOpen);
    });

    it('leaves the organization filter out until there are two organizations to choose from', () => {
        const options = buildOptions({ organizations: [organizations[0]] });
        const search = buildPageSearchConfig(
            { prefix: 'demo', tableConfig: buildTableConfig({ isOrganizationFilterEnabled: true }) },
            options
        );

        expect(search?.fields).toEqual([name]);
        expect(search?.onPanelOpen).toBe(options.onPanelOpen);
    });

    it('builds no search for a table without one', () => {
        expect(
            buildPageSearchConfig(
                { prefix: 'demo', tableConfig: new PageTableConfig({ columns: [], loadRow: () => [] }) },
                buildOptions()
            )
        ).toBeNull();
    });
});
