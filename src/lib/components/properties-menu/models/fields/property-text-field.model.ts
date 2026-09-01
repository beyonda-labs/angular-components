import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertyTextFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    multiline?: boolean;
    placeholder?: string;
    readonly?: boolean;
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
