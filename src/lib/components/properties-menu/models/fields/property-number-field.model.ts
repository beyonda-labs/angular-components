import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export class PropertyNumberField extends PropertyField<number> {
    isReadonly: boolean;
    placeholder: string;

    max?: number;
    min?: number;
    step?: number;
    unit?: string;

    constructor({
        max,
        min,
        placeholder = '',
        step,
        unit,
        isReadonly = false,
        ...base
    }: PropertyNumberFieldParameters) {
        super({ ...base, type: PropertyFieldType.Number });

        this.isReadonly = isReadonly;
        this.max = max;
        this.min = min;
        this.placeholder = placeholder;
        this.step = step;
        this.unit = unit;
    }
}

export interface PropertyNumberFieldParameters extends Omit<PropertyFieldParameters<number>, 'type'> {
    isReadonly?: boolean;
    max?: number;
    min?: number;
    placeholder?: string;
    step?: number;
    unit?: string;
}
