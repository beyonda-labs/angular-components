import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertyOption } from '../property-option.model';

export class PropertySegmentedField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];

    constructor({ options = [], ...base }: PropertySegmentedFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Segmented });
        this.options = options;
    }
}

export interface PropertySegmentedFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOption<T>[];
}
