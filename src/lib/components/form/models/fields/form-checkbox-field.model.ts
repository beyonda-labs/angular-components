import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormCheckboxField extends FormField {
    isSwitch: boolean;

    constructor({ isSwitch = false, ...base }: FormCheckboxFieldParameters) {
        super({ ...base, type: FormFieldType.Checkbox });

        this.isSwitch = isSwitch;
    }
}

export interface FormCheckboxFieldParameters extends FormFieldBaseParameters {
    isSwitch?: boolean;
}
