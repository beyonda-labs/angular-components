import { BeyAvatarConfig, BeyAvatarVariant, BeyCardListFold, BeyCardListItem } from '@beyonda-labs/angular-components';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

import { CARDS_STYLE_GUIDE_PREFIX } from '../models/cards-style-guide.model';

export function buildPerson(key: string, [name, surname]: [string, string]): BeyCardListItem {
    return new BeyCardListItem({
        avatar: new BeyAvatarConfig({ name, surname, variant: BeyAvatarVariant.Soft }),
        key,
        subtitle: `${name.toLowerCase()}@example.test`,
        title: `${name} ${surname}`
    });
}

export function buildTeam(key: string, title: string, members: BeyCardListItem[]): BeyCardListItem {
    return new BeyCardListItem({
        fold: new BeyCardListFold({
            emptyLabel: `${CARDS_STYLE_GUIDE_PREFIX}.teams.empty`,
            hideLabel: `${CARDS_STYLE_GUIDE_PREFIX}.teams.hide`,
            items: members,
            showLabel: `${CARDS_STYLE_GUIDE_PREFIX}.teams.show`
        }),
        icon: faUsers,
        key,
        subtitle: `${CARDS_STYLE_GUIDE_PREFIX}.teams.members.${members.length === 1 ? 'one' : 'other'}`,
        subtitleParameters: { count: members.length },
        title
    });
}
