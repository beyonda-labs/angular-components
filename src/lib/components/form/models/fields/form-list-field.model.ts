import { Signal } from '@angular/core';

import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormListField extends FormField {
    items: Signal<string[]> | string[];

    constructor({ items = [], ...base }: FormListFieldParameters) {
        super({ ...base, type: FormFieldType.List });

        this.items = items;
    }
}

export interface FormListFieldParameters extends FormFieldBaseParameters {
    items?: Signal<string[]> | string[];
}
