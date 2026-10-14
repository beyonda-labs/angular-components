import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { trackControl } from '../functions/control-state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
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

    readonly controlState = trackControl(this.control);

    isChecked(value: string): boolean {
        return this.controlState.value() === value;
    }

    isDisabled(option: FormFieldOption): boolean {
        return this.controlState.isDisabled() || (option.isDisabled ?? false);
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    onBlur(): void {
        this.control().markAsTouched();
    }

    select(value: string): void {
        const control = this.control();

        control.setValue(value);
        control.markAsDirty();
    }
}
