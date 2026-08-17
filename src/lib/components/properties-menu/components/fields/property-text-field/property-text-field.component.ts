import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertyVariableService } from '../../../services/property-variable.service';
import { PROPERTY_VARIABLE_ICON } from '../../../utils/property-variable-icon.util';
import { VariablePickerComponent } from '../../variable-picker/variable-picker.component';

export interface PropertyTextFieldActionTrigger {
    key: string;
    selectionEnd: number;
    selectionStart: number;
}

export interface PropertyTextFieldVariableInsertion {
    value: string;
    variable: PropertyVariable;
}

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule, VariablePickerComponent],
    selector: 'bey-property-text-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-text-field.component.html'
})
export class PropertyTextFieldComponent {
    @Input() actionButtonTooltipKey?: string;
    @Input({ required: true }) field!: PropertyTextField;

    @Output() actionTriggered = new EventEmitter<PropertyTextFieldActionTrigger>();
    @Output() valueChange = new EventEmitter<string>();
    @Output() variableInserted = new EventEmitter<PropertyTextFieldVariableInsertion>();
    @Output() variableRequest = new EventEmitter<void>();

    pickerOpen = false;

    readonly variableIcon = PROPERTY_VARIABLE_ICON;

    readonly propertyVariableService = inject(PropertyVariableService);

    private selectionEnd: number | null = null;
    private selectionStart: number | null = null;

    get hasSelection(): boolean {
        return this.selectionStart !== null && this.selectionStart !== this.selectionEnd;
    }

    get isMultiline(): boolean {
        return this.field.multiline;
    }

    closePicker(): void {
        this.pickerOpen = false;
    }

    onActionButtonClick(): void {
        if (!this.field.actionButton) {
            return;
        }

        this.actionTriggered.emit({
            key: this.field.actionButton.key ?? this.field.id,
            selectionEnd: this.selectionEnd ?? 0,
            selectionStart: this.selectionStart ?? 0
        });
    }

    onBlur(event: FocusEvent): void {
        this.trackSelection(event.target as HTMLInputElement | HTMLTextAreaElement);
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;

        this.trackSelection(target);
        this.valueChange.emit(target.value);
    }

    onKeyup(event: Event): void {
        this.trackSelection(event.target as HTMLInputElement | HTMLTextAreaElement);
    }

    onSelect(event: Event): void {
        this.trackSelection(event.target as HTMLInputElement | HTMLTextAreaElement);
    }

    onVariableSelected(variable: PropertyVariable): void {
        const expression = `{{ ${variable.path} }}`;
        const currentValue = this.field.value ?? '';
        const position = this.selectionStart ?? currentValue.length;
        const value = currentValue.slice(0, position) + expression + currentValue.slice(position);

        this.pickerOpen = false;
        this.variableInserted.emit({ value, variable });
    }

    togglePicker(): void {
        this.pickerOpen = !this.pickerOpen;
        this.variableRequest.emit();
    }

    private trackSelection(target: HTMLInputElement | HTMLTextAreaElement): void {
        this.selectionStart = target.selectionStart;
        this.selectionEnd = target.selectionEnd;
    }
}
