import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormCheckboxField extends FormField {
    constructor({
        key,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible = true,
        isRequired,
        validators
    }: FormCheckboxFieldParameters) {
        super({
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelTooltipVisible,
            isLabelVisible,
            isRequired,
            key,
            type: FormFieldType.Checkbox,
            validators
        });
    }
}

interface FormCheckboxFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    validators?: FormFieldValidator[];
}
