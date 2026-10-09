import { FormField, FormFieldBaseParameters, FormFieldOption, FormFieldType, FormRule } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';

export class FormCheckboxGroupField extends FormField {
    options: FormRule<FormFieldOption[]>;

    constructor({ options = [], ...base }: FormCheckboxGroupFieldParameters) {
        super({ ...base, type: FormFieldType.CheckboxGroup });

        this.options = options;
    }
}

export interface FormCheckboxGroupFieldParameters extends FormFieldBaseParameters {
    options?: FormRule<FormFieldOption[]>;
    validators?: FormFieldCustomValidator[];
}
