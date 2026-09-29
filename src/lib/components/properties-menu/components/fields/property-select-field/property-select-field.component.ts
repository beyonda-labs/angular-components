import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { OptionPickerOption } from '../../../../../internal/option-picker/models/option-picker-option.model';
import { OptionPickerComponent } from '../../../../../internal/option-picker/option-picker.component';
import { toVariableOptions } from '../../../functions/property-variable-options';
import { PropertySelectField } from '../../../models/fields/property-select-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyOption } from '../../../models/property-option.model';
import { PROPERTY_VARIABLE_ICON } from '../../../models/property-variable.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, OptionPickerComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-select-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css', './property-select-field.component.css'],
    templateUrl: './property-select-field.component.html'
})
export class PropertySelectFieldComponent {
    readonly field = input.required<PropertySelectField>();
    readonly labelling = input.required<PropertyFieldLabelling>();

    readonly valueChange = output<unknown>();

    readonly filteredOptions = computed(() => {
        const term = this.query().trim().toLowerCase();
        const { options } = this.field();

        return term
            ? options.filter(option => this.translateService.instant(option.label).toLowerCase().includes(term))
            : options;
    });
    readonly inputValue = computed(() => (this.isOpen() ? this.query() : this.selectedLabel()));
    readonly isOpen = signal(false);
    readonly optionsId = computed(() => `${this.labelling().controlId}-options`);
    readonly pickerOpen = signal(false);
    readonly query = signal('');
    readonly selectedLabel = computed(() => {
        const { options, value } = this.field();
        const selected = options.find(option => option.value === value);

        return selected ? this.translateService.instant(selected.label) : '';
    });
    readonly variableIcon = PROPERTY_VARIABLE_ICON;
    readonly variableOptions = computed(() => toVariableOptions(this.field().variables));

    private readonly translateService = inject(TranslateService);

    close(): void {
        this.isOpen.set(false);
        this.query.set('');
    }

    closeVariablePicker(): void {
        this.pickerOpen.set(false);
    }

    onChange(event: Event): void {
        const rawValue = (event.target as HTMLSelectElement).value;
        const option = this.field().options.find(current => String(current.value) === rawValue);

        this.valueChange.emit(option ? option.value : rawValue);
    }

    onFocus(): void {
        this.isOpen.set(true);
        this.query.set('');
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();

            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            const first = this.filteredOptions().find(option => !option.disabled);

            if (first) {
                this.close();
                this.valueChange.emit(first.value);
            }
        }
    }

    onOptionPicked(option: PropertyOption, event: Event): void {
        event.preventDefault();

        if (option.disabled) {
            return;
        }

        this.close();
        this.valueChange.emit(option.value);
    }

    onQueryInput(event: Event): void {
        this.query.set((event.target as HTMLInputElement).value);
        this.isOpen.set(true);
    }

    onVariableSelected(option: OptionPickerOption): void {
        this.closeVariablePicker();
        this.valueChange.emit(`{{ ${option.value} }}`);
    }

    toggleVariablePicker(): void {
        this.pickerOpen.update(isOpen => !isOpen);

        if (this.pickerOpen()) {
            this.close();
        }
    }
}
