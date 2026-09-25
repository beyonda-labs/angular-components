import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextField } from '../../../models/fields/form-text-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-text-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-text.component.html'
})
export class FormTextFieldComponent {
    @Input({ required: true }) field!: FormTextField;
    @Input({ required: true }) prefix!: string;

    @Input({ required: true }) control!: FormControl<string | null>;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
