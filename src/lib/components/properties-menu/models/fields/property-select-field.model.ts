import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyOption, PropertyOptionParameters } from '../property-option.model';

export interface PropertySelectFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOptionParameters<T>[];
    searchable?: boolean;
}

export class PropertySelectField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];
    searchable: boolean;

    constructor({ options = [], searchable = false, ...base }: PropertySelectFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Select });

        this.options = options.map(option => (option instanceof PropertyOption ? option : new PropertyOption(option)));
        this.searchable = searchable;
    }
}
