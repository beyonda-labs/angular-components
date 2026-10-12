import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyAvatarComponent,
    BeyAvatarConfig,
    BeyAvatarVariant,
    BeyCardComponent,
    BeyCardConfig,
    BeyCardListComponent,
    BeyCardListConfig,
    BeyCardListFold,
    BeyCardListItem,
    BeyCardListVariant,
    BeyCardStat,
    BeyCardStatsComponent,
    BeyCardStatsConfig,
    BeyToastService
} from '@beyonda-labs/angular-components';
import { faFolder } from '@fortawesome/free-regular-svg-icons';
import { faShieldHalved, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.cards';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAvatarComponent, BeyCardComponent, BeyCardListComponent, BeyCardStatsComponent, TranslateModule],
    selector: 'bey-cards-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './cards-style-guide.component.html'
})
export class CardsStyleGuideComponent {
    private readonly toastService = inject(BeyToastService);

    readonly avatars = [
        new BeyAvatarConfig({ name: 'Ada', surname: 'Lovelace' }),
        new BeyAvatarConfig({ name: 'Grace', surname: 'Hopper', variant: BeyAvatarVariant.Soft })
    ];
    readonly card = new BeyCardConfig({ count: 3, title: `${PREFIX}.card.title` });
    readonly empty = new BeyCardListConfig({
        emptyLabel: `${PREFIX}.empty.label`,
        items: [],
        title: `${PREFIX}.empty.title`
    });
    readonly people = new BeyCardListConfig({
        items: [buildPerson('u1', ['Ada', 'Lovelace']), buildPerson('u2', ['Grace', 'Hopper'])],
        title: `${PREFIX}.people.title`
    });
    readonly roles = new BeyCardListConfig({
        count: 2,
        items: [
            new BeyCardListItem({
                icon: faShieldHalved,
                key: 'editors',
                onClick: () => this.open(),
                subtitle: `${PREFIX}.roles.editors`,
                title: 'Editors'
            }),
            new BeyCardListItem({ icon: faShieldHalved, key: 'readers', title: 'Readers' })
        ],
        title: `${PREFIX}.roles.title`,
        variant: BeyCardListVariant.Separate
    });
    readonly stats = new BeyCardStatsConfig({
        items: [
            new BeyCardStat({ icon: faUser, key: 'people', label: `${PREFIX}.stats.people`, value: 3 }),
            new BeyCardStat({ icon: faUsers, key: 'teams', label: `${PREFIX}.stats.teams`, value: 2 }),
            new BeyCardStat({ icon: faFolder, key: 'projects', label: `${PREFIX}.stats.projects`, value: 12 })
        ]
    });
    readonly teams = new BeyCardListConfig({
        count: 2,
        items: [
            buildTeam('research', 'Research', [buildPerson('u2', ['Grace', 'Hopper'])]),
            buildTeam('platform', 'Platform', [])
        ],
        title: `${PREFIX}.teams.title`
    });

    private open(): void {
        this.toastService.showSuccess({ message: `${PREFIX}.roles.toast` });
    }
}

function buildPerson(key: string, [name, surname]: [string, string]): BeyCardListItem {
    return new BeyCardListItem({
        avatar: new BeyAvatarConfig({ name, surname, variant: BeyAvatarVariant.Soft }),
        key,
        subtitle: `${name.toLowerCase()}@example.test`,
        title: `${name} ${surname}`
    });
}

function buildTeam(key: string, title: string, members: BeyCardListItem[]): BeyCardListItem {
    return new BeyCardListItem({
        fold: new BeyCardListFold({
            emptyLabel: `${PREFIX}.teams.empty`,
            hideLabel: `${PREFIX}.teams.hide`,
            items: members,
            showLabel: `${PREFIX}.teams.show`
        }),
        icon: faUsers,
        key,
        subtitle: `${PREFIX}.teams.members.${members.length === 1 ? 'one' : 'other'}`,
        subtitleParameters: { count: members.length },
        title
    });
}
