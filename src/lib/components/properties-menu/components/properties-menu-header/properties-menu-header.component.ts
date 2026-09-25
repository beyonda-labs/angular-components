import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertiesMenuHeaderConfig } from '../../models/properties-menu-header.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-properties-menu-header',
    standalone: true,
    styleUrls: ['./properties-menu-header.component.css'],
    templateUrl: './properties-menu-header.component.html'
})
export class PropertiesMenuHeaderComponent {
    readonly config = input.required<PropertiesMenuHeaderConfig>();

    readonly closeIcon = faXmark;
}
