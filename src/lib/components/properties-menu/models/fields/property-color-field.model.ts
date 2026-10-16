import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export class PropertyColorField extends PropertyField<string> {
    isReadonly: boolean;

    constructor({ isReadonly = false, ...base }: PropertyColorFieldParameters) {
        super({ ...base, type: PropertyFieldType.Color });

        this.isReadonly = isReadonly;
    }
}

export interface PropertyColorFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    isReadonly?: boolean;
}
