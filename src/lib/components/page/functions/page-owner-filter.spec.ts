import { SearchFieldType } from '../../search/models/search.model';
import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { PageTableConfig, PageTableSearchConfig } from '../models/page-table.model';
import { buildPageOwnerField, hasOwnerFilter, readOwnerFilterUrl } from './page-owner-filter';

describe('buildPageOwnerField', () => {
    it('offers each owner by name, filtering the owner id with equals only', () => {
        expect(
            buildPageOwnerField([
                { id: 'u1', name: 'Ada' },
                { id: 'u2', name: 'Grace' }
            ])
        ).toMatchObject({
            key: 'ownerId',
            label: 'angular-components.page.search.fields.owner-id',
            operators: [SearchFilterOperator.Equals],
            options: [
                { label: 'Ada', value: 'u1' },
                { label: 'Grace', value: 'u2' }
            ],
            type: SearchFieldType.Select
        });
    });

    it('offers nothing with one owner or none, since there is nothing to choose', () => {
        expect(buildPageOwnerField([{ id: 'u1', name: 'Ada' }])).toBeNull();
        expect(buildPageOwnerField([])).toBeNull();
    });
});

describe('hasOwnerFilter', () => {
    it('tells whether the filters already filter by owner', () => {
        expect(hasOwnerFilter([new StringFilter({ field: 'ownerId', value: 'u1' })])).toBe(true);
        expect(hasOwnerFilter([new StringFilter({ field: 'name', value: 'ada' })])).toBe(false);
    });
});

describe('readOwnerFilterUrl', () => {
    function buildTableConfig(isOwnerFilterEnabled: boolean): PageTableConfig {
        return new PageTableConfig({
            columns: [],
            loadRow: () => [],
            search: new PageTableSearchConfig({ fields: [], isOwnerFilterEnabled })
        });
    }

    it('answers the address of the resource when its search asks for the owner filter', () => {
        expect(readOwnerFilterUrl({ baseUrl: '/items', tableConfig: buildTableConfig(true) })).toBe('/items');
    });

    it('answers nothing without the option, without a search or without an address', () => {
        expect(readOwnerFilterUrl({ baseUrl: '/items', tableConfig: buildTableConfig(false) })).toBeNull();
        expect(
            readOwnerFilterUrl({
                baseUrl: '/items',
                tableConfig: new PageTableConfig({ columns: [], loadRow: () => [] })
            })
        ).toBeNull();
        expect(readOwnerFilterUrl({ tableConfig: buildTableConfig(true) })).toBeNull();
    });
});
