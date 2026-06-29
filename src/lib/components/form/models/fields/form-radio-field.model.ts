import { FormField, FormFieldColumn, FormFieldOption, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormRadioField extends FormField {
    options: FormFieldOption[];

    constructor({
        key,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        isRequired,
        options = [],
        validators
    }: FormRadioFieldParameters) {
        super({
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelTooltipVisible,
            isLabelVisible,
            isRequired,
            key,
            type: FormFieldType.Radio,
            validators
        });
        this.options = options;
    }
}

interface FormRadioFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    options?: FormFieldOption[];
    validators?: FormFieldValidator[];
}
