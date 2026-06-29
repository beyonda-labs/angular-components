import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { CellType, LinkTableCell, TableCell } from '../../models/table-cell.model';

@Component({
    imports: [TooltipModule, TranslateModule],
    selector: 'bey-table-cell',
    standalone: true,
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.css']
})
export class TableCellComponent {
    @Input({ required: true }) cell!: TableCell;
    @Input() isHeader = false;
    @Input() showTooltip = false;

    protected readonly cellType = CellType;

    get content(): string {
        return this.cell?.content === null || this.cell?.content === undefined ? '' : String(this.cell.content);
    }

    get linkCell(): LinkTableCell {
        return this.cell as LinkTableCell;
    }

    hasTooltip(): boolean {
        return this.showTooltip && Boolean(this.cell?.tooltip);
    }

    onLinkClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        if (this.cell.type === CellType.Link) {
            this.linkCell.action();
        }
    }
}