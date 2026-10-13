import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { CardStatsConfig } from './models/card-stats.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-card-stats',
    standalone: true,
    styleUrls: ['./card-stats.component.css'],
    templateUrl: './card-stats.component.html'
})
export class CardStatsComponent {
    readonly config = input.required<CardStatsConfig>();
}
