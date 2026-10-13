import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CardHeadingLevel } from '../../models/cards.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-card-heading',
    standalone: true,
    styleUrls: ['./card-heading.component.css'],
    templateUrl: './card-heading.component.html'
})
export class CardHeadingComponent {
    readonly count = input<number>();
    readonly headingId = input.required<string>();
    readonly level = input.required<CardHeadingLevel>();
    readonly title = input.required<string>();

    readonly hasCount = computed(() => this.count() !== undefined);
    readonly isCard = computed(() => this.level() === CardHeadingLevel.Card);
}
