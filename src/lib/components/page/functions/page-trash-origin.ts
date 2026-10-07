import { TableCell } from '../../table/models/table-cell.model';
import { PageItem } from '../models/page-item.model';
import { readRowField } from './page-row';

const ORIGIN_SEPARATOR = ' / ';

export function readParentPath(item: PageItem, field: string): string[] | null {
    const value = readRowField(item, field);

    return Array.isArray(value) ? value.map(name => String(name)) : null;
}

export function withOriginTooltip(cells: TableCell[], rootLabel: string, parentPath: string[]): TableCell[] {
    const [first, ...rest] = cells;

    if (!first) {
        return cells;
    }

    const tooltip = [rootLabel, ...parentPath].join(ORIGIN_SEPARATOR);
    const copy = Object.assign(Object.create(Object.getPrototypeOf(first) as object) as TableCell, first, {
        tooltip,
        tooltipItems: undefined
    });

    return [copy, ...rest];
}
