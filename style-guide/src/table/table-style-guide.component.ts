import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeyBadgeConfig,
    BeyBadgeTableCell,
    BeyBadgeVariant,
    BeyLinkTableCell,
    BeyTableColumn,
    BeyTableComponent,
    BeyTableConfig,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.table';
const SKILL_BADGE_VARIANTS = [BeyBadgeVariant.Primary, BeyBadgeVariant.Info, BeyBadgeVariant.Purple];
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
}

const PEOPLE: Person[] = [
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
                new BeyTableColumn({ key: 'name', tooltip: `${PREFIX}.tooltips.name`, width: 30 }),
                new BeyTableColumn({ key: 'role', width: 20 }),
                new BeyTableColumn({ key: 'status', tooltip: `${PREFIX}.tooltips.status`, width: 15 }),
                new BeyTableColumn({ key: 'skills', tooltip: `${PREFIX}.tooltips.skills`, width: 25 }),
                new BeyTableColumn({ key: 'action', width: 10 })
            ],
            items,
            loadRow: item => this.loadRow(item),
            prefix: PREFIX,
            selectedItemsChange: selected => this.selected.set(selected.map(item => item.name))
        });
    }

    private loadRow({
        name,
        role,
        skills,
        status
    }: Person): (BeyTextTableCell | BeyBadgeTableCell | BeyLinkTableCell)[] {
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
            new BeyBadgeTableCell({
                badges: skills.map(
                    (skill, index) =>
                        new BeyBadgeConfig({
                            label: skill,
                            variant: SKILL_BADGE_VARIANTS[index % SKILL_BADGE_VARIANTS.length]
                        })
                )
            }),
            new BeyLinkTableCell({
                action: () => this.opened.set(name),
                content: `${PREFIX}.actions.open`,
                tooltip: `${PREFIX}.actions.open`,
                translate: true
            })
        ];
    }
}
