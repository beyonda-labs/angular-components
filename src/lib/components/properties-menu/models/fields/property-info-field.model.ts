import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export interface PropertyInfoItem {
    label: string;

    icon?: IconDefinition;
}

export class PropertyInfoField extends PropertyField<string> {
    items: PropertyInfoItem[];

    constructor({ items = [], ...base }: PropertyInfoFieldParameters) {
        super({ ...base, disabled: true, type: PropertyFieldType.Info });

        this.items = items;
    }
}

export interface PropertyInfoFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    items?: PropertyInfoItem[];
}
