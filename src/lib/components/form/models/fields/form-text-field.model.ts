import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export type FormTextFieldParameters = FormFieldBaseParameters;

export class FormTextField extends FormField {
    constructor({ ...base }: FormTextFieldParameters) {
        super({ ...base, type: FormFieldType.Text });
    }
}
