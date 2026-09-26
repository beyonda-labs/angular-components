import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormSelectField } from '../../../models/fields/form-select-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-select-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-select.component.html'
})
export class FormSelectFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormSelectField>();
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
