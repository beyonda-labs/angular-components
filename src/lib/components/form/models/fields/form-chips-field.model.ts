import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';

export class FormChipsField extends FormField {
    canAddDuplicates: boolean;

    maxItems?: number;

    constructor({ maxItems, canAddDuplicates = false, ...base }: FormChipsFieldParameters) {
        super({ ...base, type: FormFieldType.Chips });

        this.canAddDuplicates = canAddDuplicates;
        this.maxItems = maxItems;
    }
}

export interface FormChipsFieldParameters extends FormFieldBaseParameters {
    canAddDuplicates?: boolean;
    maxItems?: number;
    validators?: FormFieldCustomValidator[];
}
