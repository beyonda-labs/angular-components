import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextareaField } from '../../../models/fields/form-textarea-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-textarea-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-textarea.component.html'
})
export class FormTextareaFieldComponent {
    @Input({ required: true }) field!: FormTextareaField;
    @Input({ required: true }) prefix!: string;

    @Input({ required: true }) control!: FormControl<string | null>;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
