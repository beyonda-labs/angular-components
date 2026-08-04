import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertyNumberFieldParameters extends Omit<PropertyFieldParameters<number>, 'type'> {
    max?: number;
    min?: number;
    placeholder?: string;
    readonly?: boolean;
    step?: number;
    unit?: string;
}

export class PropertyNumberField extends PropertyField<number> {
    placeholder: string;
    readonly: boolean;

    max?: number;
    min?: number;
    step?: number;
    unit?: string;

    constructor({ max, min, placeholder = '', readonly = false, step, unit, ...base }: PropertyNumberFieldParameters) {
        super({ ...base, type: PropertyFieldType.Number });

        this.max = max;
        this.min = min;
        this.placeholder = placeholder;
        this.readonly = readonly;
        this.step = step;
        this.unit = unit;
    }
}
