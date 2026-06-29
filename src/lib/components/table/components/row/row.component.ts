import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TableConfig, TableRow } from '../../models/table.model';
import { TableCellComponent } from '../cell/cell.component';

@Component({
    imports: [TranslateModule, TableCellComponent],
    selector: 'bey-table-row',
    standalone: true,
    templateUrl: './row.component.html',
    styleUrls: ['./row.component.css']
})
export class TableRowComponent {
    @Input({ required: true }) config!: TableConfig;
    @Input({ required: true }) gridTemplateColumns!: string;
    @Input() isHeader = false;
    @Input({ required: true }) row!: TableRow;
    @Input() selectionIndeterminate = false;
    @Input() selectionLabel = 'angular-components.table.select-row';

    @Output() selectionChange = new EventEmitter<boolean>();

    getSelectRowLabel(): string {
        return this.selectionLabel;
    }

    onCheckboxChange(event: Event): void {
        const { checked } = event.target as HTMLInputElement;

        this.selectionChange.emit(checked);
    }

    onCheckboxClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    onRowClick(): void {
        if (!this.config.selectable || this.isHeader) {
            return;
        }

        this.selectionChange.emit(!this.row.selected);
    }
}
