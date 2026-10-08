import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertySpacingValue } from '../property-value.model';

export class PropertySpacingField extends PropertyField<PropertySpacingValue> {
    readonly: boolean;

    constructor({ readonly = false, ...base }: PropertySpacingFieldParameters) {
        super({ ...base, type: PropertyFieldType.Spacing });

        this.readonly = readonly;
    }
}

export interface PropertySpacingFieldParameters extends Omit<PropertyFieldParameters<PropertySpacingValue>, 'type'> {
    readonly?: boolean;
}
