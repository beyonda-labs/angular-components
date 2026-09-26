import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TableRow } from '../../models/table.model';
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
    readonly gridTemplateColumns = input.required<string>();
    readonly isHeader = input(false);
    readonly row = input.required<TableRow<T | null>>();
    readonly selectable = input.required<boolean>();
    readonly selectionIndeterminate = input(false);
    readonly selectionLabel = input('angular-components.table.select-row');

    readonly selectionChange = output<boolean>();

    onCheckboxChange(event: Event): void {
        this.selectionChange.emit((event.target as HTMLInputElement).checked);
    }

    onRowClick(): void {
        if (this.selectable() && !this.isHeader()) {
            this.selectionChange.emit(!this.row().selected);
        }
    }
}
