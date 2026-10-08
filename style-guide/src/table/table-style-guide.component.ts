import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
    BeyTableSort,
    BeyTableSortDirection,
    BeyTagsTableCell,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { faEye, faFolder, faUser } from '@fortawesome/free-solid-svg-icons';
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

interface TeamRow {
    id: string;
    isTeam: boolean;
    name: string;

    team?: string;
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

const TEAM_ROWS: TeamRow[] = [
    { id: 'platform', isTeam: true, name: 'Platform' },
    { id: 'research', isTeam: true, name: 'Research' },
    { id: 'ada', isTeam: false, name: 'Ada Lovelace', team: 'Platform' },
    { id: 'grace', isTeam: false, name: 'Grace Hopper', team: 'Research' }
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
    readonly config = computed(() =>
        this.buildConfig(sortPeople(PEOPLE, this.sort()), this.sort(), 'style-guide-people')
    );
    readonly dropped = signal('');
    readonly emptyConfig = this.buildConfig([]);
    readonly opened = signal('');
    readonly selected = signal<string[]>([]);
    readonly sort = signal<BeyTableSort | null>(null);
    readonly teamRows = signal(TEAM_ROWS);
    readonly teamsConfig = computed(
        () =>
            new BeyTableConfig<TeamRow>({
                columns: [new BeyTableColumn({ key: 'name', width: 3 }), new BeyTableColumn({ key: 'team', width: 2 })],
                height: 'auto',
                isDropAllowed: (target, rows) => target.isTeam && rows.every(row => row.team !== target.name),
                isRowDraggable: row => !row.isTeam,
                items: this.teamRows(),
                loadRow: row => [
                    new BeyTextTableCell({ content: row.name, icon: row.isTeam ? faFolder : faUser }),
                    new BeyTextTableCell({ content: row.team ?? '' })
                ],
                onRowDrop: (target, rows) => this.moveToTeam(target, rows),
                prefix: PREFIX
            })
    );

    private buildConfig(
        items: Person[],
        sort: BeyTableSort | null = null,
        storageKey?: string
    ): BeyTableConfig<Person> {
        return new BeyTableConfig<Person>({
            columns: [
                new BeyTableColumn({
                    isHideable: false,
                    isSortable: true,
                    key: 'name',
                    tooltip: `${PREFIX}.tooltips.name`,
                    width: 25
                }),
                new BeyTableColumn({ isSortable: true, key: 'role', width: 18 }),
                new BeyTableColumn({ key: 'status', tooltip: `${PREFIX}.tooltips.status`, width: 12 }),
                new BeyTableColumn({
                    isSortable: true,
                    key: 'joinedAt',
                    tooltip: `${PREFIX}.tooltips.joined-at`,
                    width: 15
                }),
                new BeyTableColumn({
                    isVisible: false,
                    key: 'skills',
                    tooltip: `${PREFIX}.tooltips.skills`,
                    width: 20
                }),
                new BeyTableColumn({ isHideable: false, key: 'action', width: '7rem' })
            ],
            items,
            loadRow: item => this.loadRow(item),
            onSortChange: sort => this.sort.set(sort),
            prefix: PREFIX,
            selectedItemsChange: selected => this.selected.set(selected.map(item => item.name)),
            sort: sort ?? undefined,
            storageKey
        });
    }

    private loadRow({ joinedAt, name, role, skills, status }: Person): BeyTableCell[] {
        return [
            new BeyTextTableCell({ content: name, icon: faUser, tooltip: name }),
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
                icon: faEye,
                tooltip: `${PREFIX}.actions.open`,
                translate: true
            })
        ];
    }

    private moveToTeam(target: TeamRow, rows: TeamRow[]): void {
        const moved = new Set(rows.map(row => row.id));

        this.teamRows.update(current => current.map(row => (moved.has(row.id) ? { ...row, team: target.name } : row)));
        this.dropped.set(`${rows.map(row => row.name).join(', ')} → ${target.name}`);
    }
}

function sortPeople(people: Person[], sort: BeyTableSort | null): Person[] {
    if (!sort) {
        return people;
    }

    const field = sort.field as 'joinedAt' | 'name' | 'role';
    const factor = sort.direction === BeyTableSortDirection.Desc ? -1 : 1;

    return [...people].sort(
        (first, second) => factor * String(first[field] ?? '').localeCompare(String(second[field] ?? ''))
    );
}
