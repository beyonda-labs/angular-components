import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormTextField extends FormField {
    constructor({ ...base }: FormTextFieldParameters) {
        super({ ...base, type: FormFieldType.Text });
    }
}

export type FormTextFieldParameters = FormFieldBaseParameters;
