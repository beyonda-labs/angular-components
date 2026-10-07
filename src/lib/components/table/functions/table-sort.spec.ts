import { TableColumn, TableSortDirection, TableSortState } from '../models/table.model';
import { nextTableSort, toTableSortState } from './table-sort';

const NAME = new TableColumn({ isSortable: true, key: 'name' });
const UPDATED = new TableColumn({ isSortable: true, key: 'updatedAt', sortField: 'updated' });

describe('nextTableSort', () => {
    it('sorts a column ascending, then descending, then not at all', () => {
        const ascending = nextTableSort(null, NAME);
        const descending = nextTableSort(ascending, NAME);

        expect(ascending).toEqual({ direction: TableSortDirection.Asc, field: 'name' });
        expect(descending).toEqual({ direction: TableSortDirection.Desc, field: 'name' });
        expect(nextTableSort(descending, NAME)).toBeNull();
    });

    it('starts ascending on another column, by its sort field', () => {
        expect(nextTableSort({ direction: TableSortDirection.Desc, field: 'name' }, UPDATED)).toEqual({
            direction: TableSortDirection.Asc,
            field: 'updated'
        });
    });
});

describe('toTableSortState', () => {
    it('names the state of a sortable column after the sort', () => {
        expect(toTableSortState({ direction: TableSortDirection.Asc, field: 'name' }, NAME)).toBe(
            TableSortState.Ascending
        );
        expect(toTableSortState({ direction: TableSortDirection.Desc, field: 'name' }, NAME)).toBe(
            TableSortState.Descending
        );
        expect(toTableSortState({ direction: TableSortDirection.Desc, field: 'name' }, UPDATED)).toBe(
            TableSortState.None
        );
        expect(toTableSortState(null, NAME)).toBe(TableSortState.None);
    });

    it('gives no state to a column that is not sortable', () => {
        expect(toTableSortState(null, new TableColumn({ key: 'role' }))).toBeNull();
    });
});
