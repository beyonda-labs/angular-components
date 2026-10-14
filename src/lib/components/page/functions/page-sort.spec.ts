import { TableColumn, TableSortDirection } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { SearchSortDirection } from '../models/page-search.model';
import { PageColumnContext, PageTableConfig } from '../models/page-table.model';
import { hasSortableColumn, isPageSortShown, toSearchSort } from './page-sort';

function buildConfig(columns: TableColumn[]): PageConfig {
    return new PageConfig({ prefix: 'demo', tableConfig: new PageTableConfig({ columns, loadRow: () => [] }) });
}

describe('hasSortableColumn', () => {
    it('tells whether any column of the table sorts from its header', () => {
        expect(hasSortableColumn(buildConfig([new TableColumn({ key: 'name' })]))).toBe(false);
        expect(hasSortableColumn(buildConfig([new TableColumn({ isSortable: true, key: 'name' })]))).toBe(true);
        expect(hasSortableColumn(new PageConfig({ prefix: 'demo' }))).toBe(false);
    });
});

describe('isPageSortShown', () => {
    const NAME = new TableColumn({ isHideable: false, isSortable: true, key: 'name' });
    const CLIENT = new TableColumn({ isSortable: true, key: 'client', sortField: 'clientName' });
    const BY_CLIENT = { direction: TableSortDirection.Asc, field: 'clientName' };
    const TABLE = {
        columns: [NAME, CLIENT],
        isColumnShown: ({ key }: TableColumn, { isSearching }: PageColumnContext): boolean =>
            key !== 'client' || isSearching
    };

    it('tells whether a column the list shows sorts by the field of the sort, and takes no sort as shown', () => {
        expect(isPageSortShown(BY_CLIENT, TABLE, { isSearching: true }, {})).toBe(true);
        expect(isPageSortShown(BY_CLIENT, TABLE, { isSearching: false }, {})).toBe(false);
        expect(isPageSortShown(null, TABLE, { isSearching: false }, {})).toBe(true);
    });

    it('leaves out the columns the choice of the user hides', () => {
        expect(isPageSortShown(BY_CLIENT, TABLE, { isSearching: true }, { client: false })).toBe(false);
        expect(isPageSortShown(BY_CLIENT, { columns: [NAME, CLIENT] }, { isSearching: false }, {})).toBe(true);
    });
});

describe('toSearchSort', () => {
    it('turns the sort of a header into the sort of the search', () => {
        expect(toSearchSort({ direction: TableSortDirection.Desc, field: 'createdAt' })).toEqual({
            direction: SearchSortDirection.Desc,
            field: 'createdAt'
        });
        expect(toSearchSort({ direction: TableSortDirection.Asc, field: 'name' })).toEqual({
            direction: SearchSortDirection.Asc,
            field: 'name'
        });
    });
});
