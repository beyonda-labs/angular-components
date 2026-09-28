import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeyBadgeConfig,
    BeyBadgeTableCell,
    BeyBadgeVariant,
    BeyDateTableCell,
    BeyLinkTableCell,
    BeyTableCell,
    BeyTableColumn,
    BeyTableComponent,
    BeyTableConfig,
    BeyTagsTableCell,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.table';
const STATUS_BADGE_VARIANTS: Record<string, BeyBadgeVariant> = {
    active: BeyBadgeVariant.Success,
    review: BeyBadgeVariant.Warning
};

interface Person {
    id: number;
    name: string;
    role: string;
    skills: string[];
    status: string;

    joinedAt?: number;
}

const PEOPLE: Person[] = [
    {
        id: 1,
        joinedAt: Date.UTC(2021, 2, 14, 12),
        name: 'Ada Lovelace',
        role: 'Principal Engineer',
        skills: ['Angular', 'TypeScript', 'RxJS'],
        status: 'active'
    },
    {
        id: 2,
        joinedAt: Date.UTC(2019, 11, 9, 12),
        name: 'Grace Hopper',
        role: 'Platform Architect',
        skills: ['Node.js', 'Docker'],
        status: 'review'
    },
    { id: 3, name: 'Katherine Johnson', role: 'Operations Analyst', skills: ['SQL'], status: 'paused' }
];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyTableComponent, TranslateModule],
    selector: 'bey-table-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './table-style-guide.component.html'
})
export class TableStyleGuideComponent {
    readonly config = this.buildConfig(PEOPLE);
    readonly emptyConfig = this.buildConfig([]);
    readonly opened = signal('');
    readonly selected = signal<string[]>([]);

    private buildConfig(items: Person[]): BeyTableConfig<Person> {
        return new BeyTableConfig<Person>({
            columns: [
                new BeyTableColumn({ key: 'name', tooltip: `${PREFIX}.tooltips.name`, width: 25 }),
                new BeyTableColumn({ key: 'role', width: 18 }),
                new BeyTableColumn({ key: 'status', tooltip: `${PREFIX}.tooltips.status`, width: 12 }),
                new BeyTableColumn({ key: 'joinedAt', tooltip: `${PREFIX}.tooltips.joined-at`, width: 15 }),
                new BeyTableColumn({ key: 'skills', tooltip: `${PREFIX}.tooltips.skills`, width: 20 }),
                new BeyTableColumn({ key: 'action', width: 10 })
            ],
            items,
            loadRow: item => this.loadRow(item),
            prefix: PREFIX,
            selectedItemsChange: selected => this.selected.set(selected.map(item => item.name))
        });
    }

    private loadRow({ joinedAt, name, role, skills, status }: Person): BeyTableCell[] {
        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: role, tooltip: role }),
            new BeyBadgeTableCell({
                badges: [
                    new BeyBadgeConfig({
                        label: `${PREFIX}.status.${status}`,
                        variant: STATUS_BADGE_VARIANTS[status] ?? BeyBadgeVariant.Neutral
                    })
                ],
                tooltip: `${PREFIX}.status.${status}`,
                translate: true
            }),
            new BeyDateTableCell({ value: joinedAt }),
            new BeyTagsTableCell({ tags: skills }),
            new BeyLinkTableCell({
                action: () => this.opened.set(name),
                content: `${PREFIX}.actions.open`,
                tooltip: `${PREFIX}.actions.open`,
                translate: true
            })
        ];
    }
}
