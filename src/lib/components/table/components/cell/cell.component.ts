import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, output } from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowsUpDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { TooltipListComponent } from '../../../../internal/tooltip-list/tooltip-list.component';
import { BadgeComponent } from '../../../badge/badge.component';
import { BadgeConfig, BadgeVariant } from '../../../badge/models/badge.model';
import { TableSortState } from '../../models/table.model';
import {
    BadgeTableCell,
    CellType,
    DateTableCell,
    LinkTableCell,
    TableCell,
    TagsTableCell,
    TextTableCell
} from '../../models/table-cell.model';

const BADGE_CELL_TYPES = new Set([CellType.Badge, CellType.Tags]);
const SORT_ICONS: Record<TableSortState, IconDefinition> = {
    [TableSortState.Ascending]: faArrowUp,
    [TableSortState.Descending]: faArrowDown,
    [TableSortState.None]: faArrowsUpDown
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BadgeComponent, FontAwesomeModule, TooltipListComponent, TooltipModule, TranslateModule],
    selector: 'bey-table-cell',
    standalone: true,
    styleUrls: ['./cell.component.css'],
    templateUrl: './cell.component.html'
})
export class TableCellComponent {
    private readonly locale = inject(LOCALE_ID);

    readonly cell = input.required<TableCell>();
    readonly isHeader = input(false);
    readonly sortState = input<TableSortState | null>(null);

    readonly sortToggle = output<void>();

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
    readonly icon = computed(() => {
        const cell = this.cell();

        return cell instanceof LinkTableCell || cell instanceof TextTableCell ? cell.icon : undefined;
    });
    readonly isBadge = computed(() => BADGE_CELL_TYPES.has(this.cell().type));
    readonly isLink = computed(() => this.cell().type === CellType.Link);
    readonly isSorted = computed(() => {
        const sortState = this.sortState();

        return sortState !== null && sortState !== TableSortState.None;
    });
    readonly sortIcon = computed(() => SORT_ICONS[this.sortState() ?? TableSortState.None]);
    readonly tooltip = computed(() => this.cell().tooltip ?? '');
    readonly tooltipItems = computed(() => this.cell().tooltipItems ?? []);

    onLinkClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        (this.cell() as LinkTableCell).action();
    }

    onSortClick(event: MouseEvent): void {
        event.stopPropagation();
        this.sortToggle.emit();
    }
}

function toDateText({ format, value }: DateTableCell, locale: string): string {
    return value === null || value === undefined || value === '' ? '' : formatDate(value, format, locale);
}
