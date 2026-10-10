import { TableCell } from './table-cell.model';

export const TABLE_ROWS_DRAG_TYPE = 'application/x-bey-table-rows';

export enum TableSortDirection {
    Asc = 'asc',
    Desc = 'desc'
}

export enum TableSortState {
    Ascending = 'ascending',
    Descending = 'descending',
    None = 'none'
}

export type TableColumnChoices = Record<string, boolean>;

export interface TableColumnsMenuEntry {
    isChecked: boolean;
    isDisabled: boolean;
    key: string;
    label: string;
}

export interface TableSort {
    direction: TableSortDirection;
    field: string;
}

export interface VisibleTableColumn {
    column: TableColumn;
    index: number;
}

export class TableColumn {
    isHideable: boolean;
    isSortable: boolean;
    isVisible: boolean;
    key: string;
    sortField: string;
    width: number | string;

    label?: string;
    tooltip?: string;

    constructor({
        isHideable = true,
        isSortable = false,
        isVisible = true,
        key,
        label,
        sortField = key,
        tooltip,
        width = 10
    }: TableColumnParameters) {
        this.isHideable = isHideable;
        this.isSortable = isSortable;
        this.isVisible = isVisible;
        this.key = key;
        this.label = label;
        this.sortField = sortField;
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

    isDropAllowed?: (target: T, items: T[]) => boolean;
    isRowDraggable?: (item: T) => boolean;
    isRowSelected?: (item: T) => boolean;
    onRowDrop?: (target: T, items: T[]) => void;
    onSortChange?: (sort: TableSort | null) => void;
    selectedItemsChange?: (items: T[], indexes: number[]) => void;
    sort?: TableSort;
    storageKey?: string;

    constructor({
        columns,
        loadRow,
        prefix,
        height = '60vh',
        isDropAllowed,
        isRowDraggable,
        isRowSelected,
        items = [],
        onRowDrop,
        onSortChange,
        selectable = true,
        selectedItemsChange,
        sort,
        storageKey
    }: TableConfigParameters<T>) {
        this.columns = columns;
        this.height = height;
        this.isDropAllowed = isDropAllowed;
        this.isRowDraggable = isRowDraggable;
        this.isRowSelected = isRowSelected;
        this.items = items;
        this.loadRow = loadRow;
        this.onRowDrop = onRowDrop;
        this.onSortChange = onSortChange;
        this.prefix = prefix;
        this.selectable = selectable;
        this.selectedItemsChange = selectedItemsChange;
        this.sort = sort;
        this.storageKey = storageKey;
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

    isHideable?: boolean;
    isSortable?: boolean;
    isVisible?: boolean;
    label?: string;
    sortField?: string;
    tooltip?: string;
    width?: number | string;
}

export interface TableConfigParameters<T> {
    columns: TableColumn[];
    loadRow: (item: T) => TableCell[];
    prefix: string;

    height?: string;
    isDropAllowed?: (target: T, items: T[]) => boolean;
    isRowDraggable?: (item: T) => boolean;
    isRowSelected?: (item: T) => boolean;
    items?: T[];
    onRowDrop?: (target: T, items: T[]) => void;
    onSortChange?: (sort: TableSort | null) => void;
    selectable?: boolean;
    selectedItemsChange?: (items: T[], indexes: number[]) => void;
    sort?: TableSort;
    storageKey?: string;
}

export interface TableRowParameters<T> {
    cells: TableCell[];
    content: T;

    selected?: boolean;
}
