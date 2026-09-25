import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export class FormTextVariableField extends FormField {
    options: FormRule<FormFieldOption[]>;

    constructor({ options = [], ...base }: FormTextVariableFieldParameters) {
        super({ ...base, type: FormFieldType.TextVariable });

        this.options = options;
    }
}

export interface FormTextVariableFieldParameters extends FormFieldBaseParameters {
    options?: FormRule<FormFieldOption[]>;
}
