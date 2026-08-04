import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertyColorFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    readonly?: boolean;
}

export class PropertyColorField extends PropertyField<string> {
    readonly: boolean;

    constructor({ readonly = false, ...base }: PropertyColorFieldParameters) {
        super({ ...base, type: PropertyFieldType.Color });

        this.readonly = readonly;
    }
}
