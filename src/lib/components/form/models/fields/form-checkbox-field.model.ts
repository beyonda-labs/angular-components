import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';
import { FormFieldAsyncValidator, FormFieldValidator } from '../form-field-validator.model';

export class FormCheckboxField extends FormField {
    isSwitch: boolean;

    constructor({
        key,
        asyncValidators,
        columns,
        isDisabled,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible = true,
        isRequired,
        isSwitch = false,
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

        this.isSwitch = isSwitch;
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
    /** Renders the checkbox as a switch/toggle instead of the default square checkbox. */
    isSwitch?: boolean;
    validators?: FormFieldValidator[];
}
