import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { nextDomId } from '../dom-ids/dom-ids';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-settings-section',
    standalone: true,
    styleUrls: ['./settings-section.component.css'],
    templateUrl: './settings-section.component.html'
})
export class SettingsSectionComponent {
    readonly descriptionKey = input('');
    readonly titleKey = input.required<string>();

    readonly titleId = nextDomId('bey-settings-section-title');
}
