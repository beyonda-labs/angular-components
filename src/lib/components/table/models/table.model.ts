import { TableCell } from './table-cell.model';

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

export class TableConfig<T> {
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

export class TableRow<T> {
    cells: TableCell[];
    content: T;
    selected: boolean;

    constructor({ cells, content, selected = false }: TableRowParameters<T>) {
        this.cells = cells;
        this.content = content;
        this.selected = selected;
    }
}

export interface TableColumnParameters {
    key: string;

    tooltip?: string;
    width?: number;
}

export interface TableConfigParameters<T> {
    columns: TableColumn[];
    loadRow: (item: T) => TableCell[];
    prefix: string;

    height?: string;
    isRowSelected?: (item: T) => boolean;
    items?: T[];
    selectable?: boolean;
    selectedItemsChange?: (items: T[], indexes: number[]) => void;
}

export interface TableRowParameters<T> {
    cells: TableCell[];
    content: T;

    selected?: boolean;
}
