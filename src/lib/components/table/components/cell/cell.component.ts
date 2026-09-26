import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BadgeComponent } from '../../../badge/badge.component';
import { BadgeConfig } from '../../../badge/models/badge.model';
import { BadgeTableCell, CellType, LinkTableCell, TableCell } from '../../models/table-cell.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BadgeComponent, TooltipModule, TranslateModule],
    selector: 'bey-table-cell',
    standalone: true,
    styleUrls: ['./cell.component.css'],
    templateUrl: './cell.component.html'
})
export class TableCellComponent {
    readonly cell = input.required<TableCell>();
    readonly isHeader = input(false);

    /** The cell's `translate` decides for its badges too. */
    readonly badges = computed<BadgeConfig[]>(() => {
        const cell = this.cell();

        return ((cell as BadgeTableCell).badges ?? []).map(
            badge => new BadgeConfig({ ...badge, translate: cell.translate })
        );
    });
    readonly content = computed(() => {
        const { content } = this.cell();

        return content === null || content === undefined ? '' : String(content);
    });
    readonly isBadge = computed(() => this.cell().type === CellType.Badge);
    readonly isLink = computed(() => this.cell().type === CellType.Link);
    readonly tooltip = computed(() => this.cell().tooltip ?? '');

    onLinkClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        (this.cell() as LinkTableCell).action();
    }
}
