import { TableSort, TableSortDirection } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { SearchSort, SearchSortDirection } from '../models/page-search.model';

export function hasSortableColumn(config: PageConfig): boolean {
    return Boolean(config.tableConfig?.columns.some(column => column.isSortable));
}

export function toSearchSort({ direction, field }: TableSort): SearchSort {
    return {
        direction: direction === TableSortDirection.Desc ? SearchSortDirection.Desc : SearchSortDirection.Asc,
        field
    };
}
