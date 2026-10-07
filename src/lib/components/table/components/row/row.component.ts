import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TABLE_ROWS_DRAG_TYPE, TableRow, TableSortState } from '../../models/table.model';
import { TableCellComponent } from '../cell/cell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableCellComponent, TranslateModule],
    selector: 'bey-table-row',
    standalone: true,
    styleUrls: ['./row.component.css'],
    templateUrl: './row.component.html'
})
export class TableRowComponent<T> {
    readonly acceptsDrop = input(false);
    readonly gridTemplateColumns = input.required<string>();
    readonly isDraggable = input(false);
    readonly isDragged = input(false);
    readonly isDropTarget = input(false);
    readonly isHeader = input(false);
    readonly row = input.required<TableRow<T | null>>();
    readonly selectable = input.required<boolean>();
    readonly selectionIndeterminate = input(false);
    readonly selectionLabel = input('angular-components.table.select-row');
    readonly sortStates = input<(TableSortState | null)[]>([]);

    readonly dragEnded = output<void>();
    readonly dragStarted = output<void>();
    readonly dropped = output<void>();
    readonly dropTargetChange = output<boolean>();
    readonly selectionChange = output<boolean>();
    readonly sortToggle = output<number>();

    onCheckboxChange(event: Event): void {
        this.selectionChange.emit((event.target as HTMLInputElement).checked);
    }

    onDragEnd(): void {
        this.dragEnded.emit();
    }

    onDragLeave(event: DragEvent): void {
        const row = event.currentTarget as HTMLElement;

        if (this.isDropTarget() && !row.contains(event.relatedTarget as Node | null)) {
            this.dropTargetChange.emit(false);
        }
    }

    onDragOver(event: DragEvent): void {
        if (!this.acceptsDrop()) {
            return;
        }

        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }

        if (!this.isDropTarget()) {
            this.dropTargetChange.emit(true);
        }
    }

    onDragStart(event: DragEvent): void {
        if (!this.isDraggable()) {
            return;
        }

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(TABLE_ROWS_DRAG_TYPE, 'rows');
        }

        this.dragStarted.emit();
    }

    onDrop(event: DragEvent): void {
        if (!this.acceptsDrop()) {
            return;
        }

        event.preventDefault();
        this.dropped.emit();
    }

    onRowClick(): void {
        if (this.selectable() && !this.isHeader()) {
            this.selectionChange.emit(!this.row().selected);
        }
    }

    onSortToggle(index: number): void {
        this.sortToggle.emit(index);
    }

    sortStateOf(index: number): TableSortState | null {
        return this.sortStates()[index] ?? null;
    }
}
