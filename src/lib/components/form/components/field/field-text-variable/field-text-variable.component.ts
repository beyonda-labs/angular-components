import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { OptionPickerComponent } from '../../../../../internal/option-picker/option-picker.component';
import { FormTextVariableField } from '../../../models/fields/form-text-variable-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, OptionPickerComponent, ReactiveFormsModule, TooltipModule, TranslateModule],
    selector: 'bey-form-text-variable-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-text-variable.component.css'],
    templateUrl: './field-text-variable.component.html'
})
export class FormTextVariableFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormTextVariableField>();
    readonly isRequired = input(false);
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly insertLabel = 'angular-components.form.text-variable-field.insert-variable';
    readonly isPickerOpen = signal(false);
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
    readonly variableIcon = faDatabase;

    private selectionStart: number | null = null;

    closePicker(): void {
        this.isPickerOpen.set(false);
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    onOptionSelected(option: FormFieldOption): void {
        const control = this.control();
        const currentValue = control.value ?? '';
        const position = this.selectionStart ?? currentValue.length;
        const expression = `{{ ${option.value} }}`;

        control.setValue(currentValue.slice(0, position) + expression + currentValue.slice(position));
        control.markAsDirty();
        this.isPickerOpen.set(false);
    }

    togglePicker(): void {
        this.isPickerOpen.update(isOpen => !isOpen);
    }

    trackSelection(event: Event): void {
        this.selectionStart = (event.target as HTMLInputElement).selectionStart;
    }
}
