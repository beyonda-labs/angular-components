import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormCheckboxField } from '../../../models/fields/form-checkbox-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-checkbox-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-checkbox.component.css'],
    templateUrl: './field-checkbox.component.html'
})
export class FormCheckboxFieldComponent {
    readonly control = input.required<FormControl<boolean | null>>();
    readonly field = input.required<FormCheckboxField>();
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly label = computed(() => this.field().label ?? `${this.prefix()}.label`);

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
