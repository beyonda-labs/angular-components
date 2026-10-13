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
    multiline: boolean;
    placeholder: string;
    readonly: boolean;

    constructor({ multiline = false, placeholder = '', readonly = false, ...base }: PropertyTextFieldParameters) {
        super({ ...base, type: multiline ? PropertyFieldType.Textarea : PropertyFieldType.Text });

        this.multiline = multiline;
        this.placeholder = placeholder;
        this.readonly = readonly;
    }
}

export interface PropertyTextFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    multiline?: boolean;
    placeholder?: string;
    readonly?: boolean;
}
