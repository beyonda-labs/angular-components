import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TableColumn, TableConfig } from '../../models/table.model';
import { BadgeTableCell, LinkTableCell, TextTableCell } from '../../models/table-cell.model';
import { TableComponent } from '../../table.component';

@Component({
    imports: [TableComponent, TranslateModule],
    selector: 'bey-table-style-guide',
    standalone: true,
    templateUrl: './table-style-guide.component.html'
})
export class TableStyleGuideComponent {
    config: TableConfig;
    emptyConfig: TableConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.config = this.buildConfig({
            items: [
                {
                    id: 1,
                    name: 'Ada Lovelace',
                    role: 'Principal Engineer',
                    skills: ['Angular', 'TypeScript', 'RxJS'],
                    status: 'angular-components-style-guide.table.status.active'
                },
                {
                    id: 2,
                    name: 'Grace Hopper',
                    role: 'Platform Architect',
                    skills: ['Node.js', 'Docker'],
                    status: 'angular-components-style-guide.table.status.review'
                },
                {
                    id: 3,
                    name: 'Katherine Johnson',
                    role: 'Operations Analyst',
                    skills: ['SQL'],
                    status: 'angular-components-style-guide.table.status.paused'
                }
            ],
            selectedItemsChange: (items, indexes) => {
                const message = this.translateService.instant('angular-components-style-guide.table.selection-changed');

                // eslint-disable-next-line no-console
                console.log(message, { indexes, items });
            }
        });

        this.emptyConfig = this.buildConfig({ items: [] });
    }

    private buildConfig({
        items,
        selectedItemsChange
    }: {
        items: Record<string, unknown>[];
        selectedItemsChange?: (items: Record<string, unknown>[], indexes: number[]) => void;
    }): TableConfig {
        return new TableConfig({
            columns: [
                new TableColumn({
                    key: 'name',
                    tooltip: 'angular-components-style-guide.table.tooltips.name',
                    width: 30
                }),
                new TableColumn({ key: 'role', width: 20 }),
                new TableColumn({
                    key: 'status',
                    tooltip: 'angular-components-style-guide.table.tooltips.status',
                    width: 15
                }),
                new TableColumn({
                    key: 'skills',
                    tooltip: 'angular-components-style-guide.table.tooltips.skills',
                    width: 25
                }),
                new TableColumn({ key: 'action', width: 10 })
            ],
            items,
            loadRow: item => [
                new TextTableCell({
                    content: String(item['name'] ?? ''),
                    tooltip: String(item['name'] ?? '')
                }),
                new TextTableCell({
                    content: String(item['role'] ?? ''),
                    tooltip: String(item['role'] ?? '')
                }),
                new BadgeTableCell({
                    badges: [
                        {
                            badgeClass: this.getStatusBadgeClass(String(item['status'] ?? '')),
                            content: String(item['status'] ?? '')
                        }
                    ],
                    tooltip: String(item['status'] ?? ''),
                    translate: true
                }),
                new BadgeTableCell({
                    badges: ((item['skills'] as string[]) ?? []).map((skill, index) => ({
                        badgeClass: this.getSkillBadgeClass(index),
                        content: skill
                    }))
                }),
                new LinkTableCell({
                    action: () => {
                        const message = this.translateService.instant(
                            'angular-components-style-guide.table.actions.opened'
                        );

                        // eslint-disable-next-line no-console
                        console.log(message, item);
                    },
                    content: 'angular-components-style-guide.table.actions.open',
                    tooltip: 'angular-components-style-guide.table.actions.open',
                    translate: true
                })
            ],
            prefix: 'angular-components-style-guide.table',
            selectedItemsChange
        });
    }

    private getStatusBadgeClass(status: string): string {
        if (status.endsWith('active')) {
            return 'bey-badge-color-success';
        }

        if (status.endsWith('review')) {
            return 'bey-badge-color-warning';
        }

        return 'bey-badge-color-neutral';
    }

    private getSkillBadgeClass(index: number): string {
        const skillBadgeClasses = ['bey-badge-color-primary', 'bey-badge-color-info', 'bey-badge-color-purple'];

        return skillBadgeClasses[index % skillBadgeClasses.length];
    }
}
