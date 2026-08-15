import { FormField, FormFieldColumn, FormFieldOption, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormAutocompleteField extends FormField {
    options: FormFieldOption[];

    emptyKey?: string;

    constructor({
        key,
        asyncValidators,
        columns,
        emptyKey,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        isRequired,
        options = [],
        placeholder,
        validators
    }: FormAutocompleteFieldParameters) {
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
            type: FormFieldType.Autocomplete,
            validators
        });
        this.emptyKey = emptyKey;
        this.options = options;
    }
}

interface FormAutocompleteFieldParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    emptyKey?: string;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: boolean;
    options?: FormFieldOption[];
    placeholder?: string;
    validators?: FormFieldValidator[];
}
