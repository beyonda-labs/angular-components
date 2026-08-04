import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyOption, PropertyOptionParameters } from '../property-option.model';

export interface PropertySegmentedFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOptionParameters<T>[];
}

export class PropertySegmentedField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];

    constructor({ options = [], ...base }: PropertySegmentedFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Segmented });

        this.options = options.map(option => (option instanceof PropertyOption ? option : new PropertyOption(option)));
    }
}
