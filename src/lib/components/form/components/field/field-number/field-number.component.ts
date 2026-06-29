import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormNumberField } from '../../../models/fields/form-number-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-number-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-number.component.html'
})
export class FormNumberFieldComponent implements OnInit {
    @Input() field: FormNumberField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<number | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                number | null
            >;
        }
    }

    getPlaceholder(): string {
        return (
            this.field.placeholder ??
            this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.placeholder'
        );
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
