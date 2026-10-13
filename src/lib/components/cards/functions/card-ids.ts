import { nextDomId } from '../../../internal/dom-ids/dom-ids';
import { CardIds } from '../models/cards.model';

export function nextCardIds(): CardIds {
    const id = nextDomId('bey-cards');

    return { fold: `${id}-fold`, subtitle: `${id}-subtitle`, title: `${id}-title` };
}
