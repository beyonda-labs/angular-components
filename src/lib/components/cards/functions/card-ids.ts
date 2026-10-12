import { CardIds } from '../models/cards.model';

let cardCount = 0;

export function nextCardIds(): CardIds {
    cardCount += 1;

    const id = `bey-cards-${cardCount}`;

    return { fold: `${id}-fold`, subtitle: `${id}-subtitle`, title: `${id}-title` };
}
