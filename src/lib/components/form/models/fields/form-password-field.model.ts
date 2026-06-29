import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormPasswordField extends FormField {
    showToggle: boolean;

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
        showToggle = true,
        validators
    }: FormPasswordFieldParameters) {
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
            type: FormFieldType.Password,
            validators
        });

        this.showToggle = showToggle;
    }
}

interface FormPasswordFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelVisible?: boolean;
    isLabelTooltipVisible?: boolean;
    isRequired?: boolean;
    placeholder?: string;
    showToggle?: boolean;
    validators?: FormFieldValidator[];
}
