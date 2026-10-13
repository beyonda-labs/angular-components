import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CardHeadingComponent } from '../components/card-heading/card-heading.component';
import { nextCardIds } from '../functions/card-ids';
import { CardHeadingLevel } from '../models/cards.model';
import { CardConfig } from './models/card.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CardHeadingComponent],
    selector: 'bey-card',
    standalone: true,
    styleUrls: ['./card.component.css'],
    templateUrl: './card.component.html'
})
export class CardComponent {
    readonly config = input.required<CardConfig>();

    readonly headingId = nextCardIds().title;
    readonly headingLevel = CardHeadingLevel.Card;
    readonly labelledBy = computed(() => (this.config().title ? this.headingId : null));
}
