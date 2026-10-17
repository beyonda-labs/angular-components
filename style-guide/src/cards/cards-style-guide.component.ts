import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyAvatarComponent,
    BeyAvatarConfig,
    BeyAvatarVariant,
    BeyCardComponent,
    BeyCardConfig,
    BeyCardListComponent,
    BeyCardListConfig,
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

import { buildPerson, buildTeam } from './functions/card-list-items';
import { CARDS_STYLE_GUIDE_PREFIX } from './models/cards-style-guide.model';

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
    readonly card = new BeyCardConfig({ count: 3, title: `${CARDS_STYLE_GUIDE_PREFIX}.card.title` });
    readonly empty = new BeyCardListConfig({
        emptyLabel: `${CARDS_STYLE_GUIDE_PREFIX}.empty.label`,
        items: [],
        title: `${CARDS_STYLE_GUIDE_PREFIX}.empty.title`
    });
    readonly people = new BeyCardListConfig({
        items: [buildPerson('u1', ['Ada', 'Lovelace']), buildPerson('u2', ['Grace', 'Hopper'])],
        title: `${CARDS_STYLE_GUIDE_PREFIX}.people.title`
    });
    readonly roles = new BeyCardListConfig({
        count: 2,
        items: [
            new BeyCardListItem({
                icon: faShieldHalved,
                key: 'editors',
                onClick: () => this.open(),
                subtitle: `${CARDS_STYLE_GUIDE_PREFIX}.roles.editors`,
                title: 'Editors'
            }),
            new BeyCardListItem({ icon: faShieldHalved, key: 'readers', title: 'Readers' })
        ],
        title: `${CARDS_STYLE_GUIDE_PREFIX}.roles.title`,
        variant: BeyCardListVariant.Separate
    });
    readonly stats = new BeyCardStatsConfig({
        items: [
            new BeyCardStat({
                icon: faUser,
                key: 'people',
                label: `${CARDS_STYLE_GUIDE_PREFIX}.stats.people`,
                value: 3
            }),
            new BeyCardStat({
                icon: faUsers,
                key: 'teams',
                label: `${CARDS_STYLE_GUIDE_PREFIX}.stats.teams`,
                value: 2
            }),
            new BeyCardStat({
                icon: faFolder,
                key: 'projects',
                label: `${CARDS_STYLE_GUIDE_PREFIX}.stats.projects`,
                value: 12
            })
        ]
    });
    readonly teams = new BeyCardListConfig({
        count: 2,
        items: [
            buildTeam('research', 'Research', [buildPerson('u2', ['Grace', 'Hopper'])]),
            buildTeam('platform', 'Platform', [])
        ],
        title: `${CARDS_STYLE_GUIDE_PREFIX}.teams.title`
    });

    private open(): void {
        this.toastService.showSuccess({ message: `${CARDS_STYLE_GUIDE_PREFIX}.roles.toast` });
    }
}
