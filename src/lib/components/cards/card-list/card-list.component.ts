import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CardHeadingComponent } from '../components/card-heading/card-heading.component';
import { nextCardIds } from '../functions/card-ids';
import { CardHeadingLevel } from '../models/cards.model';
import { CardListItemComponent } from './components/card-list-item/card-list-item.component';
import { CardListConfig } from './models/card-list.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CardHeadingComponent, CardListItemComponent, TranslateModule],
    selector: 'bey-card-list',
    standalone: true,
    styleUrls: ['./card-list.component.css'],
    templateUrl: './card-list.component.html'
})
export class CardListComponent {
    readonly config = input.required<CardListConfig>();

    readonly hasItems = computed(() => this.config().items.length > 0);
    readonly headingId = nextCardIds().title;
    readonly headingLevel = CardHeadingLevel.List;
    readonly labelledBy = computed(() => (this.config().title ? this.headingId : null));
    readonly variantClass = computed(() => `bey-cards-list--${this.config().variant}`);
}
