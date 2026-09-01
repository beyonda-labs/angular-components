import { FormField, FormFieldColumn, FormFieldOption, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormTextVariableField extends FormField {
    options: FormFieldOption[];

    constructor({
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelVisible,
        isLabelTooltipVisible,
        isRequired,
        key,
        options = [],
        placeholder,
        validators
    }: FormTextVariableFieldParameters) {
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
            type: FormFieldType.TextVariable,
            validators
        });

        this.options = options;
    }
}

interface FormTextVariableFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelVisible?: boolean;
    isLabelTooltipVisible?: boolean;
    isRequired?: boolean;
    options?: FormFieldOption[];
    placeholder?: string;
    validators?: FormFieldValidator[];
}
