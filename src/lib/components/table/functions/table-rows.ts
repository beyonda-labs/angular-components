import { TableConfig, TableRow, VisibleTableColumn } from '../models/table.model';
import { TableCell, TextTableCell } from '../models/table-cell.model';

export function buildRows<T>(config: TableConfig<T>, columns: VisibleTableColumn[]): TableRow<T>[] {
    return config.items.map(item => {
        const cells = fillCells(config.loadRow(item), config.columns.length);

        return new TableRow({
            cells: columns.map(({ index }) => cells[index]),
            content: item,
            isSelected: config.isRowSelected?.(item) ?? false
        });
    });
}

export function withSelection<T>(row: TableRow<T>, isSelected: boolean): TableRow<T> {
    return new TableRow({ cells: row.cells, content: row.content, isSelected });
}

function fillCells(cells: TableCell[], count: number): TableCell[] {
    const missing = Math.max(count - cells.length, 0);

    return [...cells, ...Array.from({ length: missing }, () => new TextTableCell({ content: '' }))];
}
