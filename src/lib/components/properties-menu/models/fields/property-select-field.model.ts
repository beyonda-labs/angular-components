import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertyOption } from '../property-option.model';
import { PropertyVariable } from '../property-variable.model';

export class PropertySelectField<T = unknown> extends PropertyField<T> {
    isSearchable: boolean;
    options: PropertyOption<T>[];
    variables: PropertyVariable[];

    constructor({ options = [], variables = [], isSearchable = false, ...base }: PropertySelectFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Select });
        this.isSearchable = isSearchable;
        this.options = options;
        this.variables = variables;
    }
}

export interface PropertySelectFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    isSearchable?: boolean;
    options?: PropertyOption<T>[];
    variables?: PropertyVariable[];
}
