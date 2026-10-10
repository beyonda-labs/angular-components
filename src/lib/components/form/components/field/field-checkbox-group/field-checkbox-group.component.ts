import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormCheckboxGroupField } from '../../../models/fields/form-checkbox-group-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { trackControl } from '../functions/control-state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-form-checkbox-group-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-checkbox-group.component.html'
})
export class FormCheckboxGroupFieldComponent {
    readonly control = input.required<FormControl<string[] | null>>();
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormCheckboxGroupField>();
    readonly isRequired = input(false);
    readonly label = input.required<string>();
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly controlState = trackControl(this.control);

    isChecked(value: string): boolean {
        return this.values().includes(value);
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

    toggle(value: string, isChecked: boolean): void {
        const control = this.control();
        const values = this.values().filter(current => current !== value);

        control.setValue(isChecked ? [...values, value] : values);
        control.markAsDirty();
        control.markAsTouched();
    }

    private values(): string[] {
        return this.controlState.value() ?? [];
    }
}
