import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export class PropertyColorField extends PropertyField<string> {
    readonly: boolean;

    constructor({ readonly = false, ...base }: PropertyColorFieldParameters) {
        super({ ...base, type: PropertyFieldType.Color });

        this.readonly = readonly;
    }
}

export interface PropertyColorFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    readonly?: boolean;
}
