import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    imports: [TranslateModule],
    selector: 'bey-badge-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './badge-style-guide.component.css'],
    templateUrl: './badge-style-guide.component.html'
})
export class BadgeStyleGuideComponent {
    emphasisClasses = [
        'bey-badge-default',
        'bey-badge-outline',
        'bey-badge-subtle',
        'bey-badge-soft',
        'bey-badge-neutral',
        'bey-badge-secondary',
        'bey-badge-tertiary',
        'bey-badge-muted',
        'bey-badge-strong',
        'bey-badge-inverse'
    ];

    colorClasses = [
        'bey-badge-color-primary',
        'bey-badge-color-secondary',
        'bey-badge-color-success',
        'bey-badge-color-warning',
        'bey-badge-color-error',
        'bey-badge-color-info',
        'bey-badge-color-neutral',
        'bey-badge-color-purple',
        'bey-badge-color-teal',
        'bey-badge-color-pink'
    ];
}
