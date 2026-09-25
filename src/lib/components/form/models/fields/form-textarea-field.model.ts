import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormTextareaField extends FormField {
    rows: number;

    maxHeight?: string;

    constructor({ maxHeight, rows = 3, ...base }: FormTextareaFieldParameters) {
        super({ ...base, type: FormFieldType.Textarea });

        this.maxHeight = maxHeight;
        this.rows = rows;
    }
}

export interface FormTextareaFieldParameters extends FormFieldBaseParameters {
    maxHeight?: string;
    rows?: number;
}
