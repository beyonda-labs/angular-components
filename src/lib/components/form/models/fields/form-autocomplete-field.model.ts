import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export class FormAutocompleteField extends FormField {
    isFreeTextAllowed: boolean;
    options: FormRule<FormFieldOption[]>;

    emptyKey?: string;

    constructor({ emptyKey, isFreeTextAllowed = false, options = [], ...base }: FormAutocompleteFieldParameters) {
        super({ ...base, type: FormFieldType.Autocomplete });

        this.emptyKey = emptyKey;
        this.isFreeTextAllowed = isFreeTextAllowed;
        this.options = options;
    }
}

export interface FormAutocompleteFieldParameters extends FormFieldBaseParameters {
    emptyKey?: string;
    isFreeTextAllowed?: boolean;
    options?: FormRule<FormFieldOption[]>;
}
