import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

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
