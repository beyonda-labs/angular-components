import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormCheckboxField } from '../../../models/fields/form-checkbox-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-checkbox-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-checkbox.component.html'
})
export class FormCheckboxFieldComponent {
    @Input({ required: true }) field!: FormCheckboxField;
    @Input({ required: true }) prefix!: string;

    @Input({ required: true }) control!: FormControl<boolean | null>;

    getLabel(): string {
        return `${this.prefix}.label`;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
