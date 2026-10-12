export enum CardHeadingLevel {
    Card = 'card',
    List = 'list'
}

export interface CardIds {
    fold: string;
    subtitle: string;
    title: string;
}

export const CARDS_EMPTY_KEY = 'angular-components.cards.empty';

export const CARDS_FOLD_HIDE_KEY = 'angular-components.cards.fold.hide';

export const CARDS_FOLD_SHOW_KEY = 'angular-components.cards.fold.show';
