import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export interface FormInfoItem {
    label: string;

    icon?: IconDefinition;
    tooltip?: string;
    tooltipItems?: string[];
}

export class FormInfoField extends FormField {
    items: FormInfoItem[];

    constructor({ items = [], ...base }: FormInfoFieldParameters) {
        super({ ...base, type: FormFieldType.Info });

        this.items = items;
    }
}

export interface FormInfoFieldParameters extends FormFieldBaseParameters {
    items?: FormInfoItem[];
}
