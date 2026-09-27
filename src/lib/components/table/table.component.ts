import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    input,
    linkedSignal,
    viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { toKeySegment } from '../../internal/i18n/key-segment';
import { TableRowComponent } from './components/row/row.component';
import { TableColumn, TableConfig, TableRow } from './models/table.model';
import { TextTableCell } from './models/table-cell.model';

const SELECTION_COLUMN_WIDTH = '3.25rem';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableRowComponent, TranslateModule],
    selector: 'bey-table',
    standalone: true,
    styleUrls: ['./table.component.css'],
    templateUrl: './table.component.html'
})
export class TableComponent<T> {
    readonly config = input.required<TableConfig<T>>();

    readonly rows = linkedSignal(() => buildRows(this.config()));

    readonly allSelected = computed(() => this.rows().length > 0 && this.rows().every(row => row.selected));
    readonly emptyLabel = computed(() => `${this.config().prefix}.empty`);
    readonly gridTemplateColumns = computed(() => {
        const { columns, selectable } = this.config();
        const dataColumns = columns.map(column => `minmax(0, ${Math.max(column.width, 1)}fr)`);

        return [...(selectable ? [SELECTION_COLUMN_WIDTH] : []), ...dataColumns].join(' ');
    });
    readonly headerRow = computed(
        () =>
            new TableRow<T | null>({
                cells: this.config().columns.map(column => this.buildHeaderCell(column)),
                content: null,
                selected: this.allSelected()
            })
    );
    readonly someSelected = computed(() => !this.allSelected() && this.rows().some(row => row.selected));

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

    onRowSelectionChange(index: number, selected: boolean): void {
        this.rows.update(rows => rows.map((row, current) => (current === index ? withSelection(row, selected) : row)));
        this.reportSelection();
    }

    private buildHeaderCell(column: TableColumn): TextTableCell {
        return new TextTableCell({
            content: `${this.config().prefix}.columns.${toKeySegment(column.key)}`,
            tooltip: column.tooltip,
            translate: true
        });
    }

    private reportSelection(): void {
        const indexes = this.rows().flatMap((row, index) => (row.selected ? [index] : []));

        this.config().selectedItemsChange?.(
            indexes.map(index => this.rows()[index].content),
            indexes
        );
    }
}

function buildRows<T>(config: TableConfig<T>): TableRow<T>[] {
    return config.items.map(
        item =>
            new TableRow({
                cells: config.loadRow(item),
                content: item,
                selected: config.isRowSelected?.(item) ?? false
            })
    );
}

function withSelection<T>(row: TableRow<T>, selected: boolean): TableRow<T> {
    return new TableRow({ cells: row.cells, content: row.content, selected });
}
