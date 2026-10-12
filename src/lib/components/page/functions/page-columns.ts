import { toKeySegment } from '../../../utilities/key-segment';
import { TableColumn } from '../../table/models/table.model';
import { PageSearch } from '../models/page-search.model';
import { PageCategoryPathEntry } from '../models/page-state.model';
import { PageColumnContext, PageTableConfig } from '../models/page-table.model';
import { hasSearchCriteria } from './page-search-text';

export function buildColumnContext(
    search: PageSearch,
    textField: string | undefined,
    category: PageCategoryPathEntry | null
): PageColumnContext {
    return { isSearching: hasSearchCriteria(search, textField), ...(category ? { category } : {}) };
}

export function withColumnTooltips(columns: TableColumn[], tablePrefix: string): TableColumn[] {
    return columns.map(
        column =>
            new TableColumn({
                ...column,
                tooltip: column.tooltip ?? `${tablePrefix}.tooltips.${toKeySegment(column.key)}`
            })
    );
}

export function withShownColumns<T>(
    entries: T[],
    columns: TableColumn[],
    context: PageColumnContext,
    isColumnShown: PageTableConfig['isColumnShown']
): T[] {
    if (!isColumnShown) {
        return entries;
    }

    return entries.filter((_, index) => !columns[index] || isColumnShown(columns[index], context));
}
