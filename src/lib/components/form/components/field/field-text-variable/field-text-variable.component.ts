import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FormTextVariableField } from '../../../models/fields/form-text-variable-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { OptionPickerComponent } from './option-picker/option-picker.component';

@Component({
    imports: [FontAwesomeModule, OptionPickerComponent, ReactiveFormsModule, TooltipModule, TranslateModule],
    selector: 'bey-form-text-variable-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-text-variable.component.css'],
    templateUrl: './field-text-variable.component.html'
})
export class FormTextVariableFieldComponent {
    @Input({ required: true }) field!: FormTextVariableField;
    @Input({ required: true }) prefix!: string;
    @Input() options: FormFieldOption[] = [];

    @Input({ required: true }) control!: FormControl<string | null>;
    pickerOpen = false;

    readonly variableIcon = faDatabase;

    private selectionStart: number | null = null;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    closePicker(): void {
        this.pickerOpen = false;
    }

    togglePicker(): void {
        this.pickerOpen = !this.pickerOpen;
    }

    onBlur(event: FocusEvent): void {
        this.trackSelection(event.target as HTMLInputElement);
    }

    onKeyup(event: Event): void {
        this.trackSelection(event.target as HTMLInputElement);
    }

    onSelect(event: Event): void {
        this.trackSelection(event.target as HTMLInputElement);
    }

    onOptionSelected(option: FormFieldOption): void {
        if (!this.control) {
            return;
        }

        const currentValue = this.control.value ?? '';
        const position = this.selectionStart ?? currentValue.length;
        const expression = `{{ ${option.value} }}`;
        const updatedValue = currentValue.slice(0, position) + expression + currentValue.slice(position);

        this.control.setValue(updatedValue);
        this.control.markAsDirty();
        this.pickerOpen = false;
    }

    private trackSelection(target: HTMLInputElement): void {
        this.selectionStart = target.selectionStart;
    }
}
