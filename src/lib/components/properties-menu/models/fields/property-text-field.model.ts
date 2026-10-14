import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertyVariable } from '../property-variable.model';

export interface PropertyTextFieldActionTrigger {
    key: string;
    selectionEnd: number;
    selectionStart: number;
}

export interface PropertyTextFieldVariableInsertion {
    value: string;
    variable: PropertyVariable;
}

export class PropertyTextField extends PropertyField<string> {
    isMultiline: boolean;
    isReadonly: boolean;
    placeholder: string;

    constructor({ placeholder = '', isMultiline = false, isReadonly = false, ...base }: PropertyTextFieldParameters) {
        super({ ...base, type: isMultiline ? PropertyFieldType.Textarea : PropertyFieldType.Text });

        this.isMultiline = isMultiline;
        this.isReadonly = isReadonly;
        this.placeholder = placeholder;
    }
}

export interface PropertyTextFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    isMultiline?: boolean;
    isReadonly?: boolean;
    placeholder?: string;
}
