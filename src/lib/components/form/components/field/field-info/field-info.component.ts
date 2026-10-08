import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { TooltipListComponent } from '../../../../../internal/tooltip-list/tooltip-list.component';
import { FormInfoField } from '../../../models/fields/form-info-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipListComponent, TooltipModule, TranslateModule],
    selector: 'bey-form-info-field',
    standalone: true,
    styleUrls: ['./field-info.component.css'],
    templateUrl: './field-info.component.html'
})
export class FormInfoFieldComponent {
    readonly field = input.required<FormInfoField>();
}
