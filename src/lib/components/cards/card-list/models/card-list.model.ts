import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { AvatarConfig } from '../../avatar/models/avatar.model';
import { CARDS_EMPTY_KEY, CARDS_FOLD_HIDE_KEY, CARDS_FOLD_SHOW_KEY } from '../../models/cards.model';

export enum CardListVariant {
    Grouped = 'grouped',
    Separate = 'separate'
}

export class CardListConfig {
    emptyLabel: string;
    items: CardListItem[];
    variant: CardListVariant;

    count?: number;
    title?: string;

    constructor({
        count,
        emptyLabel = CARDS_EMPTY_KEY,
        items,
        title,
        variant = CardListVariant.Grouped
    }: CardListConfigParameters) {
        this.count = count;
        this.emptyLabel = emptyLabel;
        this.items = items;
        this.title = title;
        this.variant = variant;
    }
}

export class CardListFold {
    emptyLabel: string;
    hideLabel: string;
    isOpen: boolean;
    items: CardListItem[];
    showLabel: string;

    constructor({
        emptyLabel = CARDS_EMPTY_KEY,
        hideLabel = CARDS_FOLD_HIDE_KEY,
        isOpen = false,
        items,
        showLabel = CARDS_FOLD_SHOW_KEY
    }: CardListFoldParameters) {
        this.emptyLabel = emptyLabel;
        this.hideLabel = hideLabel;
        this.isOpen = isOpen;
        this.items = items;
        this.showLabel = showLabel;
    }
}

export class CardListItem {
    key: string;
    title: string;

    avatar?: AvatarConfig;
    fold?: CardListFold;
    icon?: IconDefinition;
    onClick?: () => void;
    subtitle?: string;
    subtitleParameters?: Record<string, unknown>;

    constructor({ avatar, fold, icon, key, onClick, subtitle, subtitleParameters, title }: CardListItemParameters) {
        this.avatar = avatar;
        this.fold = fold;
        this.icon = icon;
        this.key = key;
        this.onClick = onClick;
        this.subtitle = subtitle;
        this.subtitleParameters = subtitleParameters;
        this.title = title;
    }
}

export interface CardListConfigParameters {
    items: CardListItem[];

    count?: number;
    emptyLabel?: string;
    title?: string;
    variant?: CardListVariant;
}

export interface CardListFoldParameters {
    items: CardListItem[];

    emptyLabel?: string;
    hideLabel?: string;
    isOpen?: boolean;
    showLabel?: string;
}

export interface CardListItemParameters {
    key: string;
    title: string;

    avatar?: AvatarConfig;
    fold?: CardListFold;
    icon?: IconDefinition;
    onClick?: () => void;
    subtitle?: string;
    subtitleParameters?: Record<string, unknown>;
}
