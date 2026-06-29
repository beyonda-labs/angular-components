import { DateFormatService } from '../../services/date-format.service';
import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormDateField extends FormField {
    format: string;
    maxDate?: string;
    minDate?: string;

    constructor({
        key,
        asyncValidators,
        columns,
        format = DateFormatService.DEFAULT_FORMAT,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        isRequired,
        maxDate,
        minDate,
        placeholder,
        validators
    }: FormDateFieldParameters) {
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
            type: FormFieldType.Date,
            validators
        });

        this.format = format;
        this.maxDate = maxDate;
        this.minDate = minDate;
    }
}

interface FormDateFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    format?: string;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    maxDate?: string;
    minDate?: string;
    placeholder?: string;
    validators?: FormFieldValidator[];
}
