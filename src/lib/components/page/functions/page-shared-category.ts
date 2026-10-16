import { LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { PageCategoryIcon, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { readRowField } from './page-row';

const SHARED_FIELD = 'isShared';

export function isSharedCategory(category: PageItem, viewMode: PageViewMode): boolean {
    return viewMode === PageViewMode.Shared || readRowField(category, SHARED_FIELD) === true;
}

export function withCategoryIcon(cells: TableCell[], { icon, label }: PageCategoryIcon): TableCell[] {
    const [first, ...rest] = cells;

    if (!(first instanceof LinkTableCell || first instanceof TextTableCell)) {
        return cells;
    }

    const copy = Object.assign(Object.create(Object.getPrototypeOf(first) as object) as TableCell, first, {
        icon,
        iconLabel: label
    });

    return [copy, ...rest];
}
