import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyOption, PropertyOptionParameters } from '../property-option.model';
import { PropertyVariable, PropertyVariableParameters } from '../property-variable.model';

export interface PropertySelectFieldParameters<T = unknown> extends Omit<PropertyFieldParameters<T>, 'type'> {
    options?: PropertyOptionParameters<T>[];
    searchable?: boolean;
    variables?: PropertyVariableParameters[];
}

export class PropertySelectField<T = unknown> extends PropertyField<T> {
    options: PropertyOption<T>[];
    searchable: boolean;
    variables: PropertyVariable[];

    constructor({ options = [], searchable = false, variables = [], ...base }: PropertySelectFieldParameters<T>) {
        super({ ...base, type: PropertyFieldType.Select });

        this.options = options.map(option => (option instanceof PropertyOption ? option : new PropertyOption(option)));
        this.searchable = searchable;
        this.variables = variables.map(variable =>
            variable instanceof PropertyVariable ? variable : new PropertyVariable(variable)
        );
    }

    get holdsVariable(): boolean {
        return typeof this.value === 'string' && this.value.trim().startsWith('{{');
    }
}
