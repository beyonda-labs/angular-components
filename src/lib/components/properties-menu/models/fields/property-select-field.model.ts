import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyOption } from '../property-option.model';
import { PropertyVariable } from '../property-variable.model';

export interface PropertySelectFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOption<T>[];
    searchable?: boolean;
    variables?: PropertyVariable[];
}

export class PropertySelectField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];
    searchable: boolean;
    variables: PropertyVariable[];

    constructor({ options = [], searchable = false, variables = [], ...base }: PropertySelectFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Select });
        this.options = options;
        this.searchable = searchable;
        this.variables = variables;
    }

    get holdsVariable(): boolean {
        return typeof this.value === 'string' && this.value.trim().startsWith('{{');
    }
}
