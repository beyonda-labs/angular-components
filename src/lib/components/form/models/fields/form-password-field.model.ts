import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormPasswordField extends FormField {
    showToggle: boolean;

    constructor({ showToggle = true, ...base }: FormPasswordFieldParameters) {
        super({ ...base, type: FormFieldType.Password });

        this.showToggle = showToggle;
    }
}

export interface FormPasswordFieldParameters extends FormFieldBaseParameters {
    showToggle?: boolean;
}
