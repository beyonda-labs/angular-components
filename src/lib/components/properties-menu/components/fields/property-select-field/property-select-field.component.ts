import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PropertySelectField } from '../../../models/fields/property-select-field.model';
import { PropertyOption } from '../../../models/property-option.model';

@Component({
    imports: [TranslateModule],
    selector: 'bey-property-select-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-select-field.component.css'],
    templateUrl: './property-select-field.component.html'
})
export class PropertySelectFieldComponent {
    @Input({ required: true }) field!: PropertySelectField;

    @Output() valueChange = new EventEmitter<unknown>();

    isOpen = false;
    query = '';

    private readonly translateService = inject(TranslateService);

    get inputValue(): string {
        return this.isOpen ? this.query : this.selectedLabel;
    }

    get selectedLabel(): string {
        const selected = this.field.options.find(option => option.value === this.field.value);

        return selected ? this.translateService.instant(selected.label) : '';
    }

    get filteredOptions(): PropertyOption[] {
        const term = this.query.trim().toLowerCase();

        if (!term) {
            return this.field.options;
        }

        return this.field.options.filter(option =>
            this.translateService.instant(option.label).toLowerCase().includes(term)
        );
    }

    onChange(event: Event): void {
        const rawValue = (event.target as HTMLSelectElement).value;
        const option = this.field.options.find(current => String(current.value) === rawValue);

        this.valueChange.emit(option ? option.value : rawValue);
    }

    onFocus(): void {
        this.isOpen = true;
        this.query = '';
    }

    onQueryInput(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.isOpen = true;
    }

    onOptionPicked(option: PropertyOption, event: Event): void {
        event.preventDefault();

        if (option.disabled) {
            return;
        }

        this.close();
        this.valueChange.emit(option.value);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();

            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            const first = this.filteredOptions.find(option => !option.disabled);

            if (first) {
                this.close();
                this.valueChange.emit(first.value);
            }
        }
    }

    close(): void {
        this.isOpen = false;
        this.query = '';
    }
}
