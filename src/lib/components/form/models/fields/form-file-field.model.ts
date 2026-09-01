import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormFileField extends FormField {
    accept: string[];

    maxSizeBytes?: number;

    constructor({
        key,
        accept = [],
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible = true,
        isRequired,
        maxSizeBytes,
        validators
    }: FormFileFieldParameters) {
        super({
            asyncValidators,
            columns,
            isDisabled,
            isHidden,
            isLabelTooltipVisible,
            isLabelVisible,
            isRequired,
            key,
            type: FormFieldType.File,
            validators
        });

        this.accept = accept;
        this.maxSizeBytes = maxSizeBytes;
    }
}

interface FormFileFieldParameters {
    key: string;

    accept?: string[];
    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    maxSizeBytes?: number;
    validators?: FormFieldValidator[];
}

export { matchesAcceptPattern } from '../../../../internal/file/accept-pattern.util';
