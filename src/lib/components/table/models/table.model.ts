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
    showTooltip: boolean;

    selectedItemsChange?: (items: Record<string, unknown>[], indexes: number[]) => void;

    constructor({
        columns,
        loadRow,
        prefix,
        height = '60vh',
        items = [],
        selectable = true,
        showTooltip = false,
        selectedItemsChange
    }: TableConfigParameters) {
        this.$loadTable = new EventEmitter<void>();
        this.columns = columns;
        this.height = height;
        this.items = items;
        this.loadRow = loadRow;
        this.prefix = prefix;
        this.selectable = selectable;
        this.showTooltip = showTooltip;
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
    items?: Record<string, unknown>[];
    selectable?: boolean;
    showTooltip?: boolean;
    selectedItemsChange?: (items: Record<string, unknown>[], indexes: number[]) => void;
}

export class TableColumn {
    key: string;
    width: number;

    constructor({ key, width = 10 }: TableColumnParameters) {
        this.key = key;
        this.width = width;
    }
}

export interface TableColumnParameters {
    key: string;
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
