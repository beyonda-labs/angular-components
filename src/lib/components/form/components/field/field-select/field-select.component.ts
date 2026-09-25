import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormSelectField } from '../../../models/fields/form-select-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-select-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-select.component.html'
})
export class FormSelectFieldComponent {
    @Input({ required: true }) field!: FormSelectField;
    @Input({ required: true }) prefix!: string;
    @Input() options: FormFieldOption[] = [];

    @Input({ required: true }) control!: FormControl<string | null>;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
