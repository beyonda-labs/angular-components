import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export class FormSelectField extends FormField {
    options: FormRule<FormFieldOption[]>;

    constructor({ options = [], ...base }: FormSelectFieldParameters) {
        super({ ...base, type: FormFieldType.Select });

        this.options = options;
    }
}

export interface FormSelectFieldParameters extends FormFieldBaseParameters {
    options?: FormRule<FormFieldOption[]>;
}
