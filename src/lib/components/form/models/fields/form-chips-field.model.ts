import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';

export class FormChipsField extends FormField {
    allowDuplicates: boolean;

    maxItems?: number;

    constructor({ allowDuplicates = false, maxItems, ...base }: FormChipsFieldParameters) {
        super({ ...base, type: FormFieldType.Chips });

        this.allowDuplicates = allowDuplicates;
        this.maxItems = maxItems;
    }
}

export interface FormChipsFieldParameters extends FormFieldBaseParameters {
    allowDuplicates?: boolean;
    maxItems?: number;
    validators?: FormFieldCustomValidator[];
}
