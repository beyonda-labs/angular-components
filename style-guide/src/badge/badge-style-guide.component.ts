import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyBadgeComponent, BeyBadgeConfig, BeyBadgeVariant } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyBadgeComponent, TranslateModule],
    selector: 'bey-badge-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './badge-style-guide.component.css'],
    templateUrl: './badge-style-guide.component.html'
})
export class BadgeStyleGuideComponent {
    readonly badges = Object.values(BeyBadgeVariant).map(
        variant => new BeyBadgeConfig({ label: variant, translate: false, variant })
    );
}
