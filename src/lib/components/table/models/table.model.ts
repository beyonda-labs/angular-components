import { TableCell } from './table-cell.model';

export type TableItem = Record<string, unknown>;

export class TableConfig {
    columns: TableColumn[];
    height: string;
    items: TableItem[];
    loadRow: (item: TableItem) => TableCell[];
    prefix: string;
    selectable: boolean;

    isRowSelected?: (item: TableItem) => boolean;
    selectedItemsChange?: (items: TableItem[], indexes: number[]) => void;

    constructor({
        columns,
        loadRow,
        prefix,
        height = '60vh',
        isRowSelected,
        items = [],
        selectable = true,
        selectedItemsChange
    }: TableConfigParameters) {
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

export interface TableConfigParameters {
    columns: TableColumn[];
    loadRow: (item: TableItem) => TableCell[];
    prefix: string;

    height?: string;
    isRowSelected?: (item: TableItem) => boolean;
    items?: TableItem[];
    selectable?: boolean;
    selectedItemsChange?: (items: TableItem[], indexes: number[]) => void;
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

export class TableRow {
    cells: TableCell[];
    content: TableItem;
    selected: boolean;

    constructor({ cells, content, selected = false }: TableRowParameters) {
        this.cells = cells;
        this.content = content;
        this.selected = selected;
    }
}

export interface TableRowParameters {
    cells: TableCell[];
    content: TableItem;

    selected?: boolean;
}
