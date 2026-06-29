import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TableColumn, TableConfig } from '../../models/table.model';
import { LinkTableCell, TextTableCell } from '../../models/table-cell.model';
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
                    status: 'angular-components-style-guide.table.status.active'
                },
                {
                    id: 2,
                    name: 'Grace Hopper',
                    role: 'Platform Architect',
                    status: 'angular-components-style-guide.table.status.review'
                },
                {
                    id: 3,
                    name: 'Katherine Johnson',
                    role: 'Operations Analyst',
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
                new TableColumn({ key: 'name', width: 40 }),
                new TableColumn({ key: 'role', width: 30 }),
                new TableColumn({ key: 'status', width: 20 }),
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
                new TextTableCell({
                    content: String(item['status'] ?? ''),
                    tooltip: String(item['status'] ?? ''),
                    translate: true
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
            selectedItemsChange,
            showTooltip: true
        });
    }
}
