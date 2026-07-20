import { EventEmitter } from '@angular/core';

import { TableCell } from './table-cell.model';

export class TableConfig {
    $loadTable: EventEmitter<void>;
    columns: TableColumn[];
    height: string;
    items: Record<string, unknown>[];
    loadRow: (item: Record<string, unknown>) => TableCell[];
    prefix: string;
    selectable: boolean;

    isRowSelected?: (item: Record<string, unknown>) => boolean;
    selectedItemsChange?: (items: Record<string, unknown>[], indexes: number[]) => void;

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
        this.$loadTable = new EventEmitter<void>();
        this.columns = columns;
        this.height = height;
        this.isRowSelected = isRowSelected;
        this.items = items;
        this.loadRow = loadRow;
        this.prefix = prefix;
        this.selectable = selectable;
        this.selectedItemsChange = selectedItemsChange;
    }

    refresh(): void {
        this.$loadTable.emit();
    }
}

export interface TableConfigParameters {
    columns: TableColumn[];
    loadRow: (item: Record<string, unknown>) => TableCell[];
    prefix: string;

    height?: string;
    isRowSelected?: (item: Record<string, unknown>) => boolean;
    items?: Record<string, unknown>[];
    selectable?: boolean;
    selectedItemsChange?: (items: Record<string, unknown>[], indexes: number[]) => void;
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
    content: Record<string, unknown>;

    selected: boolean;

    constructor({ cells, content, selected = false }: TableRowParameters) {
        this.cells = cells;
        this.content = content;
        this.selected = selected;
    }
}

export interface TableRowParameters {
    cells: TableCell[];
    content: Record<string, unknown>;

    selected?: boolean;
}
