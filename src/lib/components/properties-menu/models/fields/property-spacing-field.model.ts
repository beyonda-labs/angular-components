import { PropertyFieldType } from '../../types/property-field-type';
import { PropertySpacingValue } from '../../types/property-value';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertySpacingFieldParameters extends Omit<PropertyFieldParameters<PropertySpacingValue>, 'type'> {
    readonly?: boolean;
}

export class PropertySpacingField extends PropertyField<PropertySpacingValue> {
    readonly: boolean;

    constructor({ readonly = false, ...base }: PropertySpacingFieldParameters) {
        super({ ...base, type: PropertyFieldType.Spacing });

        this.readonly = readonly;
    }
}
