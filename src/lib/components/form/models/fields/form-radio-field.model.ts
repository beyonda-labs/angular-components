import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';

export class FormRadioField extends FormField {
    options: FormRule<FormFieldOption[]>;

    constructor({ options = [], ...base }: FormRadioFieldParameters) {
        super({ ...base, type: FormFieldType.Radio });

        this.options = options;
    }
}

export interface FormRadioFieldParameters extends FormFieldBaseParameters {
    options?: FormRule<FormFieldOption[]>;
}
