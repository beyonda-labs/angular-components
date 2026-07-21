import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormChipsField } from '../../../models/fields/form-chips-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [FontAwesomeModule, FormsModule, ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-chips-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-chips.component.html'
})
export class FormChipsFieldComponent implements OnInit {
    @Input() field: FormChipsField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<string[] | null>;
    sectionGroup?: FormGroup;
    inputValue = '';

    readonly removeIcon = faXmark;

    private readonly formService = inject(FormService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                string[] | null
            >;
        }
    }

    getPlaceholder(): string {
        return (
            this.field.placeholder ??
            this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.placeholder'
        );
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    isMaxItemsReached(): boolean {
        if (this.field.maxItems === undefined) {
            return false;
        }

        return (this.control?.value?.length ?? 0) >= this.field.maxItems;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            this.addChip();
        } else if (event.key === 'Backspace' && !this.inputValue) {
            this.removeLastChip();
        }
    }

    addChip(): void {
        const value = this.inputValue.trim();

        if (!value || !this.control || this.isMaxItemsReached()) {
            return;
        }

        const currentValue = this.control.value ?? [];

        if (!this.field.allowDuplicates && currentValue.includes(value)) {
            this.inputValue = '';

            return;
        }

        this.control.setValue([...currentValue, value]);
        this.control.markAsDirty();
        this.control.markAsTouched();
        this.inputValue = '';
    }

    removeChip(index: number): void {
        if (!this.control || this.field.isDisabled) {
            return;
        }

        const currentValue = this.control.value ?? [];

        this.control.setValue(currentValue.filter((_, chipIndex) => chipIndex !== index));
        this.control.markAsDirty();
        this.control.markAsTouched();
    }

    private removeLastChip(): void {
        const currentValue = this.control?.value ?? [];

        if (currentValue.length > 0) {
            this.removeChip(currentValue.length - 1);
        }
    }
}
