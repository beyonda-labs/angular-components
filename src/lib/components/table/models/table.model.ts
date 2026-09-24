import { TableCell } from './table-cell.model';

export type TableItem = Record<string, unknown>;

export class TableConfig<T = TableItem> {
    columns: TableColumn[];
    height: string;
    items: T[];
    loadRow: (item: T) => TableCell[];
    prefix: string;
    selectable: boolean;

    isRowSelected?: (item: T) => boolean;
    selectedItemsChange?: (items: T[], indexes: number[]) => void;

    constructor({
        columns,
        loadRow,
        prefix,
        height = '60vh',
        isRowSelected,
        items = [],
        selectable = true,
        selectedItemsChange
    }: TableConfigParameters<T>) {
        this.columns = columns;
        this.height = height;
        this.isRowSelected = isRowSelected;
        this.items = items;
        this.loadRow = loadRow;
        this.prefix = prefix;
        this.selectable = selectable;
        this.selectedItemsChange = selectedItemsChange;
    }
}

export interface TableConfigParameters<T = TableItem> {
    columns: TableColumn[];
    loadRow: (item: T) => TableCell[];
    prefix: string;

    height?: string;
    isRowSelected?: (item: T) => boolean;
    items?: T[];
    selectable?: boolean;
    selectedItemsChange?: (items: T[], indexes: number[]) => void;
}

export class TableColumn {
    key: string;
    width: number;

    tooltip?: string;

    constructor({ key, tooltip, width = 10 }: TableColumnParameters) {
        this.key = key;
        this.tooltip = tooltip;
        this.width = width;
    }
}

export interface TableColumnParameters {
    key: string;

    tooltip?: string;
    width?: number;
}

export class TableRow<T = TableItem> {
    cells: TableCell[];
    content: T;
    selected: boolean;

    constructor({ cells, content, selected = false }: TableRowParameters<T>) {
        this.cells = cells;
        this.content = content;
        this.selected = selected;
    }
}

export interface TableRowParameters<T = TableItem> {
    cells: TableCell[];
    content: T;

    selected?: boolean;
}
