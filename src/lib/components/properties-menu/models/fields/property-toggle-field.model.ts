import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export type PropertyToggleFieldParameters = Omit<PropertyFieldParameters<boolean>, 'type'>;

export class PropertyToggleField extends PropertyField<boolean> {
    constructor(parameters: PropertyToggleFieldParameters) {
        super({ ...parameters, type: PropertyFieldType.Toggle });
    }
}
