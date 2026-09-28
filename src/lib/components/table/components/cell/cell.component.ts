import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { BadgeComponent } from '../../../badge/badge.component';
import { BadgeConfig, BadgeVariant } from '../../../badge/models/badge.model';
import {
    BadgeTableCell,
    CellType,
    DateTableCell,
    LinkTableCell,
    TableCell,
    TagsTableCell
} from '../../models/table-cell.model';

const BADGE_CELL_TYPES = new Set([CellType.Badge, CellType.Tags]);

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

    readonly badges = computed<BadgeConfig[]>(() => {
        const cell = this.cell();

        if (cell instanceof TagsTableCell) {
            return cell.tags.map(
                tag => new BadgeConfig({ label: tag, translate: false, variant: BadgeVariant.Outline })
            );
        }

        return cell instanceof BadgeTableCell
            ? cell.badges.map(badge => new BadgeConfig({ ...badge, translate: cell.translate }))
            : [];
    });
    readonly content = computed(() => {
        const cell = this.cell();

        if (cell instanceof DateTableCell) {
            return toDateText(cell, this.locale);
        }

        return cell.content === null || cell.content === undefined ? '' : String(cell.content);
    });
    readonly isBadge = computed(() => BADGE_CELL_TYPES.has(this.cell().type));
    readonly isLink = computed(() => this.cell().type === CellType.Link);
    readonly tooltip = computed(() => this.cell().tooltip ?? '');

    private readonly locale = inject(LOCALE_ID);

    onLinkClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        (this.cell() as LinkTableCell).action();
    }
}

function toDateText({ format, value }: DateTableCell, locale: string): string {
    return value === null || value === undefined || value === '' ? '' : formatDate(value, format, locale);
}
