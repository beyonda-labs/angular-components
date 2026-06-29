import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormTextField extends FormField {
    constructor({
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelVisible,
        isLabelTooltipVisible,
        isRequired,
        key,
        placeholder,
        validators
    }: FormTextFieldParameters) {
        super({
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelVisible,
            isLabelTooltipVisible,
            isRequired,
            key,
            placeholder,
            type: FormFieldType.Text,
            validators
        });
    }
}

interface FormTextFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelVisible?: boolean;
    isLabelTooltipVisible?: boolean;
    isRequired?: boolean;
    placeholder?: string;
    validators?: FormFieldValidator[];
}
