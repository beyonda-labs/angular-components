import { TableColumn, TableSortDirection } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { SearchSortDirection } from '../models/page-search.model';
import { PageTableConfig } from '../models/page-table.model';
import { hasSortableColumn, toSearchSort } from './page-sort';

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
