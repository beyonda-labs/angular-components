import { resolveVisibleColumns } from '../../table/functions/table-columns';
import { isTableSortShown } from '../../table/functions/table-sort';
import { TableColumnChoices, TableSort, TableSortDirection } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { SearchSort, SearchSortDirection } from '../models/page-search.model';
import { PageColumnContext, PageTableConfig } from '../models/page-table.model';
import { withShownColumns } from './page-columns';

export function hasSortableColumn(config: PageConfig): boolean {
    return Boolean(config.tableConfig?.columns.some(column => column.isSortable));
}

export function isPageSortShown(
    sort: TableSort | null,
    { columns, isColumnShown }: Pick<PageTableConfig, 'columns' | 'isColumnShown'>,
    context: PageColumnContext,
    choices: TableColumnChoices
): boolean {
    const shown = resolveVisibleColumns(withShownColumns(columns, columns, context, isColumnShown), choices);

    return (
        sort === null ||
        isTableSortShown(
            sort,
            shown.map(({ column }) => column)
        )
    );
}

export function toSearchSort({ direction, field }: TableSort): SearchSort {
    return {
        direction: direction === TableSortDirection.Desc ? SearchSortDirection.Desc : SearchSortDirection.Asc,
        field
    };
}
