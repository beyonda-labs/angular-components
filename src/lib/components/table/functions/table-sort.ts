import { TableColumn, TableSort, TableSortDirection, TableSortState } from '../models/table.model';

export function nextTableSort(sort: TableSort | null, column: TableColumn): TableSort | null {
    if (sort?.field !== column.sortField) {
        return { direction: TableSortDirection.Asc, field: column.sortField };
    }

    return sort.direction === TableSortDirection.Asc ? { direction: TableSortDirection.Desc, field: sort.field } : null;
}

export function toTableSortState(sort: TableSort | null, column: TableColumn): TableSortState | null {
    if (!column.isSortable) {
        return null;
    }

    if (sort?.field !== column.sortField) {
        return TableSortState.None;
    }

    return sort.direction === TableSortDirection.Desc ? TableSortState.Descending : TableSortState.Ascending;
}
