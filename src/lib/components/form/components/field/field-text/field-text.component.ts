import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextField } from '../../../models/fields/form-text-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-text-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-text.component.html'
})
export class FormTextFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormTextField>();
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
