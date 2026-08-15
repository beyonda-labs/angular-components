import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { FormService } from '../../../services/form.service';

const EMPTY_KEY = 'angular-components.form.autocompleteField.empty';

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-autocomplete-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-autocomplete.component.html'
})
export class FormAutocompleteFieldComponent implements OnInit {
    @Input() field: FormAutocompleteField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    @ViewChild('queryInput') queryInput?: ElementRef<HTMLInputElement>;

    clearIcon = faXmark;
    toggleIcon = faChevronDown;

    activeIndex = -1;
    isOpen = false;
    query = '';

    control?: FormControl<string | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);
    private readonly translateService = inject(TranslateService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                string | null
            >;
        }
    }

    get displayValue(): string {
        return this.isOpen ? this.query : this.getSelectedLabel();
    }

    get emptyKey(): string {
        return this.field.emptyKey ?? EMPTY_KEY;
    }

    get filteredOptions(): FormFieldOption[] {
        const term = this.query.trim().toLowerCase();

        if (!term) {
            return this.field.options;
        }

        return this.field.options.filter(option => this.getOptionLabel(option).toLowerCase().includes(term));
    }

    getOptionLabel(option: FormFieldOption): string {
        return this.translateService.instant(option.label);
    }

    getPlaceholder(): string {
        return (
            this.field.placeholder ??
            this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.placeholder'
        );
    }

    getSelectedLabel(): string {
        const selected = this.field.options.find(option => option.value === this.control?.value);

        return selected ? this.getOptionLabel(selected) : '';
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    isSelected(option: FormFieldOption): boolean {
        return option.value === this.control?.value;
    }

    onQueryInput(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.activeIndex = -1;
        this.isOpen = true;
    }

    onFocus(): void {
        this.open();
    }

    onBlur(): void {
        this.control?.markAsTouched();
        this.close();
    }

    onToggle(): void {
        if (this.isOpen) {
            this.close();

            return;
        }

        this.open();
        this.queryInput?.nativeElement.focus();
    }

    onOptionPicked(option: FormFieldOption, event?: Event): void {
        event?.preventDefault();

        if (option.isDisabled) {
            return;
        }

        this.select(option.value);
        this.close();
    }

    onClear(event: Event): void {
        event.preventDefault();
        this.select('');
        this.close();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.moveActive(event.key === 'ArrowDown' ? 1 : -1);

            return;
        }

        if (event.key === 'Enter' && this.isOpen) {
            event.preventDefault();

            const option = this.filteredOptions[this.activeIndex];

            if (option) {
                this.onOptionPicked(option);
            }
        }
    }

    private moveActive(step: number): void {
        if (!this.isOpen) {
            this.open();
        }

        const total = this.filteredOptions.length;

        if (total === 0) {
            this.activeIndex = -1;

            return;
        }

        if (this.activeIndex === -1) {
            this.activeIndex = step > 0 ? 0 : total - 1;

            return;
        }

        this.activeIndex = (this.activeIndex + step + total) % total;
    }

    private open(): void {
        this.isOpen = true;
        this.query = '';
        this.activeIndex = -1;
    }

    private close(): void {
        this.isOpen = false;
        this.query = '';
        this.activeIndex = -1;
    }

    private select(value: string): void {
        this.control?.setValue(value);
        this.control?.markAsDirty();
        this.control?.markAsTouched();
    }
}
