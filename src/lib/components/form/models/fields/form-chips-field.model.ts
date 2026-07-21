import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormChipsField extends FormField {
    allowDuplicates: boolean;
    maxItems?: number;

    constructor({
        key,
        allowDuplicates = false,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        isRequired,
        maxItems,
        placeholder,
        validators
    }: FormChipsFieldParameters) {
        super({
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelTooltipVisible,
            isLabelVisible,
            isRequired,
            key,
            placeholder,
            type: FormFieldType.Chips,
            validators
        });
        this.allowDuplicates = allowDuplicates;
        this.maxItems = maxItems;
    }
}

interface FormChipsFieldParameters {
    key: string;

    allowDuplicates?: boolean;
    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    maxItems?: number;
    placeholder?: string;
    validators?: FormFieldValidator[];
}
