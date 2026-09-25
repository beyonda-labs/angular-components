import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyOption } from '../property-option.model';

export interface PropertySegmentedFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOption<T>[];
}

export class PropertySegmentedField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];

    constructor({ options = [], ...base }: PropertySegmentedFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Segmented });
        this.options = options;
    }
}
