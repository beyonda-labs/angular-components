import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-radio-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-radio.component.html'
})
export class FormRadioFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormRadioField>();
    readonly isRequired = input(false);
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
