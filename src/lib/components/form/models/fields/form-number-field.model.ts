import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormNumberField extends FormField {
    max?: number;
    min?: number;

    constructor({
        key,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelVisible,
        isLabelTooltipVisible,
        isRequired,
        max,
        min,
        placeholder,
        validators
    }: FormNumberFieldParameters) {
        super({
            key,
            type: FormFieldType.Number,
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelVisible,
            isLabelTooltipVisible,
            isRequired,
            placeholder,
            validators
        });

        this.max = max;
        this.min = min;
    }
}

interface FormNumberFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelVisible?: boolean;
    isLabelTooltipVisible?: boolean;
    isRequired?: boolean;
    max?: number;
    min?: number;
    placeholder?: string;
    validators?: FormFieldValidator[];
}
