import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export type PropertyToggleFieldParameters = Omit<PropertyFieldParameters<boolean>, 'type'>;

export class PropertyToggleField extends PropertyField<boolean> {
    constructor(parameters: PropertyToggleFieldParameters) {
        super({ ...parameters, type: PropertyFieldType.Toggle });
    }
}
