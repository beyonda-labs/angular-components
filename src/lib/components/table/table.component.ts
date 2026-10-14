import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

import { toKeySegment } from '../../utilities/key-segment';
import { TableColumnsMenuComponent } from './components/columns-menu/columns-menu.component';
import { TableRowComponent } from './components/row/row.component';
import { buildColumnsMenuEntries, resolveVisibleColumns, toggleColumnChoice } from './functions/table-columns';
import { isTableSortShown, nextTableSort, toTableSortState } from './functions/table-sort';
import {
    TableColumn,
    TableColumnChoices,
    TableConfig,
    TableRow,
    TableSort,
    VisibleTableColumn
} from './models/table.model';
import { TableCell, TextTableCell } from './models/table-cell.model';
import { TableColumnsStorageService } from './services/table-columns-storage.service';

const COLUMNS_MENU_WIDTH = '2.75rem';
const SELECTION_COLUMN_WIDTH = '3.25rem';

interface RowDragState {
    canAcceptDrop: boolean;
    isDraggable: boolean;
    isDragged: boolean;
    isDropTarget: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableColumnsMenuComponent, TableRowComponent, TranslateModule],
    selector: 'bey-table',
    standalone: true,
    styleUrls: ['./table.component.css'],
    templateUrl: './table.component.html'
})
export class TableComponent<T> {
    private readonly tableColumnsStorageService = inject(TableColumnsStorageService);
    private readonly translateService = inject(TranslateService);

    readonly config = input.required<TableConfig<T>>();

    readonly allSelected = computed(() => this.rows().length > 0 && this.rows().every(row => row.isSelected));
    readonly columnChoices = linkedSignal({
        source: () => this.config().storageKey,
        computation: storageKey => this.tableColumnsStorageService.load(storageKey)
    });
    readonly columnsMenuEntries = computed(() => {
        const { columns, prefix, storageKey } = this.config();

        return storageKey ? buildColumnsMenuEntries(columns, this.columnChoices(), prefix) : [];
    });
    readonly emptyLabel = computed(() => `${this.config().prefix}.empty`);
    readonly gridTemplateColumns = computed(() => {
        const dataColumns = this.visibleColumns().map(({ column }) => toGridTrack(column));

        return [
            ...(this.config().isSelectable ? [SELECTION_COLUMN_WIDTH] : []),
            ...dataColumns,
            ...(this.columnsMenuEntries().length > 0 ? [COLUMNS_MENU_WIDTH] : [])
        ].join(' ');
    });
    readonly headerRow = computed(
        () =>
            new TableRow<T | null>({
                cells: this.visibleColumns().map(({ column }) => this.buildHeaderCell(column)),
                content: null,
                isSelected: this.allSelected()
            })
    );
    readonly isFilled = computed(() => !this.config().height);
    readonly rowDragStates = computed<RowDragState[]>(() => {
        const config = this.config();
        const dragged = this.dragged();
        const dropTargetIndex = this.dropTargetIndex();

        return this.rows().map((row, index) => {
            const isDragged = dragged.includes(row.content);

            return {
                canAcceptDrop:
                    dragged.length > 0 && !isDragged && (config.isDropAllowed?.(row.content, dragged) ?? false),
                isDraggable: Boolean(config.onRowDrop) && (config.isRowDraggable?.(row.content) ?? false),
                isDragged,
                isDropTarget: dropTargetIndex === index
            };
        });
    });
    readonly rows = linkedSignal<
        { columns: VisibleTableColumn[]; config: TableConfig<T>; language: string },
        TableRow<T>[]
    >({
        source: () => ({ columns: this.visibleColumns(), config: this.config(), language: this.language() }),
        computation: ({ columns, config }, previous) => {
            const rows = buildRows(config, columns);

            return previous?.source.config === config
                ? rows.map((row, index) => withSelection(row, previous.value[index]?.isSelected ?? row.isSelected))
                : rows;
        }
    });
    readonly someSelected = computed(() => !this.allSelected() && this.rows().some(row => row.isSelected));
    readonly sort = linkedSignal<TableSort | null>(() => this.config().sort ?? null);
    readonly sortStates = computed(() =>
        this.visibleColumns().map(({ column }) => toTableSortState(this.sort(), column))
    );
    readonly visibleColumns = computed(() => resolveVisibleColumns(this.config().columns, this.columnChoices()));

    private readonly dragged = linkedSignal<TableConfig<T>, T[]>({ source: this.config, computation: () => [] });
    private readonly dropTargetIndex = linkedSignal<TableConfig<T>, number | null>({
        source: this.config,
        computation: () => null
    });
    private readonly language = toSignal(this.translateService.onLangChange.pipe(map(({ lang }) => lang)), {
        initialValue: this.translateService.currentLang
    });
    private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

    constructor() {
        effect(() => {
            this.config();

            const container = this.scrollContainer();

            if (container) {
                container.nativeElement.scrollTop = 0;
            }
        });
    }

    onAllSelectionChange(selected: boolean): void {
        this.rows.update(rows => rows.map(row => withSelection(row, selected)));
        this.reportSelection();
    }

    onColumnsReset(): void {
        this.applyColumnChoices({});
        this.tableColumnsStorageService.remove(this.config().storageKey);
    }

    onColumnToggle(key: string): void {
        const { columns, storageKey } = this.config();
        const choices = toggleColumnChoice(columns, this.columnChoices(), key);

        this.applyColumnChoices(choices);
        this.tableColumnsStorageService.save(choices, storageKey);
    }

    onDropTargetChange(index: number, isDropTarget: boolean): void {
        if (isDropTarget) {
            this.dropTargetIndex.set(index);
        } else if (this.dropTargetIndex() === index) {
            this.dropTargetIndex.set(null);
        }
    }

    onRowDragEnd(): void {
        this.dragged.set([]);
        this.dropTargetIndex.set(null);
    }

    onRowDragStart(index: number): void {
        const rows = this.rows();
        const row = rows[index];

        this.dragged.set(
            row.isSelected ? rows.filter(current => current.isSelected).map(current => current.content) : [row.content]
        );
    }

    onRowDrop(index: number): void {
        const isAccepted = this.rowDragStates()[index]?.canAcceptDrop ?? false;
        const items = this.dragged();
        const target = this.rows()[index].content;

        this.onRowDragEnd();

        if (isAccepted) {
            this.config().onRowDrop?.(target, items);
        }
    }

    onRowSelectionChange(index: number, selected: boolean): void {
        this.rows.update(rows => rows.map((row, current) => (current === index ? withSelection(row, selected) : row)));
        this.reportSelection();
    }

    onSortToggle(index: number): void {
        const visible = this.visibleColumns()[index];

        if (!visible?.column.isSortable) {
            return;
        }

        const sort = nextTableSort(this.sort(), visible.column);

        this.sort.set(sort);
        this.config().onSortChange?.(sort);
    }

    private applyColumnChoices(choices: TableColumnChoices): void {
        const wasSortShown = isTableSortShown(this.sort(), this.shownColumns());

        this.columnChoices.set(choices);

        if (wasSortShown && !isTableSortShown(this.sort(), this.shownColumns())) {
            this.sort.set(null);
            this.config().onSortChange?.(null);
        }
    }

    private buildHeaderCell(column: TableColumn): TextTableCell {
        return new TextTableCell({
            content: column.label ?? `${this.config().prefix}.columns.${toKeySegment(column.key)}`,
            tooltip: column.tooltip,
            isTranslationKey: true
        });
    }

    private reportSelection(): void {
        const indexes = this.rows().flatMap((row, index) => (row.isSelected ? [index] : []));

        this.config().onSelectionChange?.(
            indexes.map(index => this.rows()[index].content),
            indexes
        );
    }

    private shownColumns(): TableColumn[] {
        return this.visibleColumns().map(({ column }) => column);
    }
}

function buildRows<T>(config: TableConfig<T>, columns: VisibleTableColumn[]): TableRow<T>[] {
    return config.items.map(item => {
        const cells = fillCells(config.loadRow(item), config.columns.length);

        return new TableRow({
            cells: columns.map(({ index }) => cells[index]),
            content: item,
            isSelected: config.isRowSelected?.(item) ?? false
        });
    });
}

function fillCells(cells: TableCell[], count: number): TableCell[] {
    const missing = Math.max(count - cells.length, 0);

    return [...cells, ...Array.from({ length: missing }, () => new TextTableCell({ content: '' }))];
}

function toGridTrack({ width }: TableColumn): string {
    return typeof width === 'number' ? `minmax(0, ${Math.max(width, 1)}fr)` : width;
}

function withSelection<T>(row: TableRow<T>, isSelected: boolean): TableRow<T> {
    return new TableRow({ cells: row.cells, content: row.content, isSelected });
}
