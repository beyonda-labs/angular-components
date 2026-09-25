import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextareaField } from '../../../models/fields/form-textarea-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-textarea-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-textarea.component.css'],
    templateUrl: './field-textarea.component.html'
})
export class FormTextareaFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormTextareaField>();
    readonly prefix = input.required<string>();

    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
