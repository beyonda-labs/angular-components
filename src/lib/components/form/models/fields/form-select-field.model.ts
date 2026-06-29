import { FormField, FormFieldColumn, FormFieldOption, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormSelectField extends FormField {
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
        placeholder,
        validators
    }: FormSelectFieldParameters) {
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
            type: FormFieldType.Select,
            validators
        });
        this.options = options;
    }
}

interface FormSelectFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    options?: FormFieldOption[];
    placeholder?: string;
    validators?: FormFieldValidator[];
}
