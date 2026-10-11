import { Signal } from '@angular/core';

import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';
import { FormAutocompleteFieldParameters } from './form-autocomplete-field.model';

export type FormListPicker = Pick<
    FormAutocompleteFieldParameters,
    'emptyKey' | 'filter' | 'onSelect' | 'placeholder' | 'search'
>;

export class FormListField extends FormField {
    isRemovable: boolean;
    items: Signal<string[]> | string[];

    emptyKey?: string;
    options?: FormRule<FormFieldOption[]>;
    picker?: FormListPicker;

    constructor({ emptyKey, isRemovable = false, items = [], options, picker, ...base }: FormListFieldParameters) {
        super({ ...base, type: FormFieldType.List });

        this.emptyKey = emptyKey;
        this.isRemovable = isRemovable;
        this.items = items;
        this.options = options;
        this.picker = picker;
    }
}

export interface FormListFieldParameters extends FormFieldBaseParameters {
    emptyKey?: string;
    isRemovable?: boolean;
    items?: Signal<string[]> | string[];
    options?: FormRule<FormFieldOption[]>;
    picker?: FormListPicker;
    validators?: FormFieldCustomValidator[];
}
