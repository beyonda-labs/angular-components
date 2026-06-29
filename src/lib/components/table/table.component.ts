import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { TableRowComponent } from './components/row/row.component';
import { TableColumn, TableConfig, TableRow } from './models/table.model';
import { TextTableCell } from './models/table-cell.model';

@Component({
    imports: [CommonModule, TranslateModule, TableRowComponent],
    selector: 'bey-table',
    standalone: true,
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css']
})
export class TableComponent implements OnDestroy {
    @Input({ required: true })
    set config(value: TableConfig) {
        this._config = value;
        this.bindRefresh();
        this.buildRows();
    }
    get config(): TableConfig {
        return this._config;
    }

    rows: TableRow[] = [];

    private _config!: TableConfig;
    private readonly configChange$ = new Subject<void>();
    private readonly destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.configChange$.next();
        this.configChange$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    get gridTemplateColumns(): string {
        if (!this.config?.columns?.length) {
            return '';
        }

        const selectionColumn = this.config.selectable ? '52px ' : '';
        const dataColumns = this.config.columns.map(column => `minmax(0, ${Math.max(column.width, 1)}fr)`).join(' ');

        return `${selectionColumn}${dataColumns}`.trim();
    }

    areAllRowsSelected(): boolean {
        return this.rows.length > 0 && this.rows.every(row => row.selected);
    }

    get headerRow(): TableRow {
        return new TableRow({
            cells: this.config.columns.map(
                column =>
                    new TextTableCell({
                        content: this.getColumnLabel(column),
                        translate: true
                    })
            ),
            content: {},
            selected: this.areAllRowsSelected()
        });
    }

    getColumnLabel(column: TableColumn): string {
        return `${this.config.prefix}.columns.${column.key}`;
    }

    getEmptyLabel(): string {
        return `${this.config.prefix}.empty`;
    }

    getSelectAllLabel(): string {
        return 'angular-components.table.select-all';
    }

    hasSomeRowsSelected(): boolean {
        return this.rows.some(row => row.selected) && !this.areAllRowsSelected();
    }

    onAllSelectionChange(checked: boolean): void {
        this.rows = this.rows.map(
            row =>
                new TableRow({
                    cells: row.cells,
                    content: row.content,
                    selected: checked
                })
        );

        this.emitSelectionChange();
    }

    onRowSelectionChange(index: number, selected: boolean): void {
        const row = this.rows[index];

        if (!row) {
            return;
        }

        row.selected = selected;
        this.emitSelectionChange();
    }

    private bindRefresh(): void {
        this.configChange$.next();

        this.config.$loadTable.pipe(takeUntil(this.configChange$), takeUntil(this.destroy$)).subscribe(() => {
            this.buildRows();
        });
    }

    private buildRows(): void {
        this.rows = this.config.items.map(
            item =>
                new TableRow({
                    cells: this.config.loadRow(item),
                    content: item
                })
        );
    }

    private emitSelectionChange(): void {
        const selectedIndexes = this.rows.flatMap((row, index) => (row.selected ? [index] : []));
        const selectedItems = selectedIndexes.map(index => this.rows[index].content);

        this.config.selectedItemsChange?.(selectedItems, selectedIndexes);
    }
}
