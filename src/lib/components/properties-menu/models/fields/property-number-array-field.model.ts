import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export class PropertyNumberArrayField extends PropertyField<number[]> {
    entryDefaultValue: number;
    minLength: number;

    max?: number;
    maxLength?: number;
    min?: number;
    step?: number;

    constructor({
        entryDefaultValue = 1,
        max,
        maxLength,
        min,
        minLength = 0,
        step,
        ...base
    }: PropertyNumberArrayFieldParameters) {
        super({ ...base, type: PropertyFieldType.NumberArray });

        this.entryDefaultValue = entryDefaultValue;
        this.max = max;
        this.maxLength = maxLength;
        this.min = min;
        this.minLength = minLength;
        this.step = step;
    }
}

export interface PropertyNumberArrayFieldParameters extends Omit<PropertyFieldParameters<number[]>, 'type'> {
    entryDefaultValue?: number;
    max?: number;
    maxLength?: number;
    min?: number;
    minLength?: number;
    step?: number;
}
