import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-radio-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-radio.component.html'
})
export class FormRadioFieldComponent {
    @Input({ required: true }) field!: FormRadioField;
    @Input({ required: true }) prefix!: string;
    @Input() options: FormFieldOption[] = [];

    @Input({ required: true }) control!: FormControl<string | null>;

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
