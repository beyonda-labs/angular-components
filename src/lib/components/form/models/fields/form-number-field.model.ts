import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';

export class FormNumberField extends FormField {
    max?: number;
    min?: number;

    constructor({ max, min, ...base }: FormNumberFieldParameters) {
        super({ ...base, type: FormFieldType.Number });

        this.max = max;
        this.min = min;
    }
}

export interface FormNumberFieldParameters extends FormFieldBaseParameters {
    max?: number;
    min?: number;
    validators?: FormFieldCustomValidator[];
}
