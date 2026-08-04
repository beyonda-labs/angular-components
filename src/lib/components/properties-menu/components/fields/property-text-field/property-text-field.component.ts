import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertyVariableService } from '../../../services/property-variable.service';
import { VariablePickerComponent } from '../../variable-picker/variable-picker.component';

export interface PropertyTextFieldVariableInsertion {
    value: string;
    variable: PropertyVariable;
}

@Component({
    imports: [FontAwesomeModule, TranslateModule, VariablePickerComponent],
    selector: 'bey-property-text-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-text-field.component.html'
})
export class PropertyTextFieldComponent {
    @Input({ required: true }) field!: PropertyTextField;

    @Output() valueChange = new EventEmitter<string>();
    @Output() variableInserted = new EventEmitter<PropertyTextFieldVariableInsertion>();
    @Output() variableRequest = new EventEmitter<void>();

    pickerOpen = false;

    readonly variableIcon = faDatabase;

    readonly propertyVariableService = inject(PropertyVariableService);

    private cursorPosition: number | null = null;

    get isMultiline(): boolean {
        return this.field.multiline;
    }

    closePicker(): void {
        this.pickerOpen = false;
    }

    onBlur(event: FocusEvent): void {
        this.trackCursor(event.target as HTMLInputElement | HTMLTextAreaElement);
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;

        this.trackCursor(target);
        this.valueChange.emit(target.value);
    }

    onKeyup(event: Event): void {
        this.trackCursor(event.target as HTMLInputElement | HTMLTextAreaElement);
    }

    onVariableSelected(variable: PropertyVariable): void {
        const expression = `{{ ${variable.path} }}`;
        const currentValue = this.field.value ?? '';
        const position = this.cursorPosition ?? currentValue.length;
        const value = currentValue.slice(0, position) + expression + currentValue.slice(position);

        this.pickerOpen = false;
        this.variableInserted.emit({ value, variable });
    }

    togglePicker(): void {
        this.pickerOpen = !this.pickerOpen;
        this.variableRequest.emit();
    }

    private trackCursor(target: HTMLInputElement | HTMLTextAreaElement): void {
        this.cursorPosition = target.selectionStart;
    }
}
