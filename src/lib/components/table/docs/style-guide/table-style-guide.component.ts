import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TableColumn, TableConfig, TableItem } from '../../models/table.model';
import { BadgeTableCell, LinkTableCell, TextTableCell } from '../../models/table-cell.model';
import { TableComponent } from '../../table.component';

const PREFIX = 'angular-components-style-guide.table';
const SKILL_BADGE_CLASSES = ['bey-badge-color-primary', 'bey-badge-color-info', 'bey-badge-color-purple'];
const STATUS_BADGE_CLASSES: Record<string, string> = {
    active: 'bey-badge-color-success',
    review: 'bey-badge-color-warning'
};

const PEOPLE: TableItem[] = [
    {
        id: 1,
        name: 'Ada Lovelace',
        role: 'Principal Engineer',
        skills: ['Angular', 'TypeScript', 'RxJS'],
        status: 'active'
    },
    { id: 2, name: 'Grace Hopper', role: 'Platform Architect', skills: ['Node.js', 'Docker'], status: 'review' },
    { id: 3, name: 'Katherine Johnson', role: 'Operations Analyst', skills: ['SQL'], status: 'paused' }
];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TableComponent, TranslateModule],
    selector: 'bey-table-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './table-style-guide.component.html'
})
export class TableStyleGuideComponent {
    readonly opened = signal('');
    readonly selected = signal<string[]>([]);

    readonly config = this.buildConfig(PEOPLE);
    readonly emptyConfig = this.buildConfig([]);

    private buildConfig(items: TableItem[]): TableConfig {
        return new TableConfig({
            columns: [
                new TableColumn({ key: 'name', tooltip: `${PREFIX}.tooltips.name`, width: 30 }),
                new TableColumn({ key: 'role', width: 20 }),
                new TableColumn({ key: 'status', tooltip: `${PREFIX}.tooltips.status`, width: 15 }),
                new TableColumn({ key: 'skills', tooltip: `${PREFIX}.tooltips.skills`, width: 25 }),
                new TableColumn({ key: 'action', width: 10 })
            ],
            items,
            loadRow: item => this.loadRow(item),
            prefix: PREFIX,
            selectedItemsChange: selected => this.selected.set(selected.map(item => String(item['name'])))
        });
    }

    private loadRow(item: TableItem): (TextTableCell | BadgeTableCell | LinkTableCell)[] {
        const name = String(item['name']);
        const role = String(item['role']);
        const status = String(item['status']);
        const skills = item['skills'] as string[];

        return [
            new TextTableCell({ content: name, tooltip: name }),
            new TextTableCell({ content: role, tooltip: role }),
            new BadgeTableCell({
                badges: [
                    {
                        badgeClass: STATUS_BADGE_CLASSES[status] ?? 'bey-badge-color-neutral',
                        content: `${PREFIX}.status.${status}`
                    }
                ],
                tooltip: `${PREFIX}.status.${status}`,
                translate: true
            }),
            new BadgeTableCell({
                badges: skills.map((skill, index) => ({
                    badgeClass: SKILL_BADGE_CLASSES[index % SKILL_BADGE_CLASSES.length],
                    content: skill
                }))
            }),
            new LinkTableCell({
                action: () => this.opened.set(name),
                content: `${PREFIX}.actions.open`,
                tooltip: `${PREFIX}.actions.open`,
                translate: true
            })
        ];
    }
}
