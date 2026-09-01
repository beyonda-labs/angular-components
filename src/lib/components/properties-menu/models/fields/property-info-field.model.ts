import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertyInfoItem {
    label: string;

    icon?: IconDefinition;
}

export interface PropertyInfoFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    items?: PropertyInfoItem[];
}

export class PropertyInfoField extends PropertyField<string> {
    items: PropertyInfoItem[];

    constructor({ items = [], ...base }: PropertyInfoFieldParameters) {
        super({ ...base, disabled: true, type: PropertyFieldType.Info });

        this.items = items;
    }
}
