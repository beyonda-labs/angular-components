import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BadgeComponent } from '../../badge.component';
import { BadgeConfig, BadgeVariant } from '../../models/badge.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BadgeComponent, TranslateModule],
    selector: 'bey-badge-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './badge-style-guide.component.css'],
    templateUrl: './badge-style-guide.component.html'
})
export class BadgeStyleGuideComponent {
    readonly badges = Object.values(BadgeVariant).map(
        variant => new BadgeConfig({ label: variant, translate: false, variant })
    );
}
