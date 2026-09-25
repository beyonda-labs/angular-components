import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormNumberField } from '../../../models/fields/form-number-field.model';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-number-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-number.component.html'
})
export class FormNumberFieldComponent {
    @Input({ required: true }) field!: FormNumberField;
    @Input({ required: true }) prefix!: string;

    @Input({ required: true }) control!: FormControl<number | null>;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    increment(): void {
        const next = (this.control?.value ?? 0) + 1;
        if (this.field.max === undefined || next <= this.field.max) {
            this.control?.setValue(next);
            this.control?.markAsDirty();
        }
    }

    decrement(): void {
        const next = (this.control?.value ?? 0) - 1;
        if (this.field.min === undefined || next >= this.field.min) {
            this.control?.setValue(next);
            this.control?.markAsDirty();
        }
    }

    isIncrementDisabled(): boolean {
        if (this.control?.disabled) {
            return true;
        }

        if (this.field.max !== undefined && (this.control?.value ?? 0) >= this.field.max) {
            return true;
        }

        return false;
    }

    isDecrementDisabled(): boolean {
        if (this.control?.disabled) {
            return true;
        }

        if (this.field.min !== undefined && (this.control?.value ?? 0) <= this.field.min) {
            return true;
        }

        return false;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
