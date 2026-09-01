import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { FormInfoField } from '../../../models/fields/form-info-field.model';

@Component({
    imports: [FontAwesomeModule],
    selector: 'bey-form-info-field',
    standalone: true,
    styleUrls: ['./field-info.component.css'],
    templateUrl: './field-info.component.html'
})
export class FormInfoFieldComponent {
    @Input() field: FormInfoField;
}
