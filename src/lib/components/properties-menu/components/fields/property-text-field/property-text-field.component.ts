import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { OptionPickerOption } from '../../../../../internal/option-picker/models/option-picker-option.model';
import { OptionPickerComponent } from '../../../../../internal/option-picker/option-picker.component';
import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PROPERTY_VARIABLE_ICON, PropertyVariable } from '../../../models/property-variable.model';
import { findVariable, toVariableExpression, toVariableOptions } from '../../../models/property-variable-options';
import { PropertiesMenuService } from '../../../services/properties-menu.service';

export interface PropertyTextFieldActionTrigger {
    key: string;
    selectionEnd: number;
    selectionStart: number;
}

export interface PropertyTextFieldVariableInsertion {
    value: string;
    variable: PropertyVariable;
}

type TextControl = HTMLInputElement | HTMLTextAreaElement;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, OptionPickerComponent, TooltipModule, TranslateModule],
    selector: 'bey-property-text-field',
    standalone: true,
    styleUrls: ['../property-field-control.styles.css'],
    templateUrl: './property-text-field.component.html'
})
export class PropertyTextFieldComponent {
    readonly actionButtonTooltipKey = input<string>('');
    readonly field = input.required<PropertyTextField>();

    readonly actionTriggered = output<PropertyTextFieldActionTrigger>();
    readonly valueChange = output<string>();
    readonly variableInserted = output<PropertyTextFieldVariableInsertion>();

    private readonly selectionEnd = signal<number | null>(null);
    private readonly selectionStart = signal<number | null>(null);
    readonly hasSelection = computed(
        () => this.selectionStart() !== null && this.selectionStart() !== this.selectionEnd()
    );
    readonly insertLabel = 'angular-components.properties-menu.text-field.insert-variable';
    readonly pickerOpen = signal(false);
    readonly showsActions = computed(() => this.field().acceptsVariable || Boolean(this.field().actionButton));
    readonly variableIcon = PROPERTY_VARIABLE_ICON;

    private readonly propertiesMenuService = inject(PropertiesMenuService);
    readonly variableOptions = computed(() => toVariableOptions(this.propertiesMenuService.variables()));

    closePicker(): void {
        this.pickerOpen.set(false);
    }

    onActionButtonClick(): void {
        const { actionButton, id } = this.field();

        if (!actionButton) {
            return;
        }

        this.actionTriggered.emit({
            key: actionButton.key ?? id,
            selectionEnd: this.selectionEnd() ?? 0,
            selectionStart: this.selectionStart() ?? 0
        });
    }

    onInput(event: Event): void {
        const target = event.target as TextControl;

        this.trackSelection(event);
        this.valueChange.emit(target.value);
    }

    onVariableSelected(option: OptionPickerOption): void {
        const variable = findVariable(this.propertiesMenuService.variables(), option.value);

        if (!variable) {
            return;
        }

        const currentValue = this.field().value ?? '';
        const position = this.selectionStart() ?? currentValue.length;
        const value = currentValue.slice(0, position) + toVariableExpression(variable) + currentValue.slice(position);

        this.pickerOpen.set(false);
        this.variableInserted.emit({ value, variable });
    }

    togglePicker(): void {
        this.pickerOpen.update(isOpen => !isOpen);
    }

    trackSelection(event: Event): void {
        const target = event.target as TextControl;

        this.selectionStart.set(target.selectionStart);
        this.selectionEnd.set(target.selectionEnd);
    }
}
