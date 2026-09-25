import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BadgeConfig } from './models/badge.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-badge',
    standalone: true,
    styleUrls: ['./badge.component.css'],
    templateUrl: './badge.component.html'
})
export class BadgeComponent {
    readonly config = input.required<BadgeConfig>();

    readonly variantClass = computed(() => `bey-badge--${this.config().variant}`);
}
