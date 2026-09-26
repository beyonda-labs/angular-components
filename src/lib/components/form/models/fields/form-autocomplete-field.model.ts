import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export class FormAutocompleteField extends FormField {
    options: FormRule<FormFieldOption[]>;

    emptyKey?: string;

    constructor({ emptyKey, options = [], ...base }: FormAutocompleteFieldParameters) {
        super({ ...base, type: FormFieldType.Autocomplete });

        this.emptyKey = emptyKey;
        this.options = options;
    }
}

export interface FormAutocompleteFieldParameters extends FormFieldBaseParameters {
    emptyKey?: string;
    options?: FormRule<FormFieldOption[]>;
}
