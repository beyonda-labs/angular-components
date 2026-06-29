import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormTextareaField extends FormField {
    maxHeight?: string;
    rows: number;

    constructor({
        key,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        isRequired,
        maxHeight,
        placeholder,
        rows = 3,
        validators
    }: FormTextareaFieldParameters) {
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
            type: FormFieldType.Textarea,
            validators
        });
        this.maxHeight = maxHeight;
        this.rows = rows;
    }
}

interface FormTextareaFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    maxHeight?: string;
    placeholder?: string;
    rows?: number;
    validators?: FormFieldValidator[];
}
