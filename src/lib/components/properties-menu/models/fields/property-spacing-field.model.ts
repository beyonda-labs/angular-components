import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertySpacingValue } from '../property-value.model';

export class PropertySpacingField extends PropertyField<PropertySpacingValue> {
    isReadonly: boolean;

    constructor({ isReadonly = false, ...base }: PropertySpacingFieldParameters) {
        super({ ...base, type: PropertyFieldType.Spacing });

        this.isReadonly = isReadonly;
    }
}

export interface PropertySpacingFieldParameters extends Omit<PropertyFieldParameters<PropertySpacingValue>, 'type'> {
    isReadonly?: boolean;
}
