import { FormFieldAsyncValidator, FormFieldValidator } from './form-field-validator.model';

export type FormFieldColumn = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface FormFieldOption {
    label: string;
    value: string;
    isDisabled?: boolean;
}

export abstract class FormField {
    asyncValidators: FormFieldAsyncValidator[];
    columns: FormFieldColumn;
    isDisabled: boolean;
    isHidden: boolean;
    isLabelVisible: boolean;
    isLabelTooltipVisible: boolean;
    isRequired: boolean;
    key: string;
    placeholder?: string;
    type: FormFieldType;
    validators: FormFieldValidator[];

    label?: string;

    constructor({
        key,
        type,

        asyncValidators = [],
        columns = 12,
        isDisabled = false,
        isHidden = false,
        isLabelVisible = true,
        isLabelTooltipVisible = false,
        isRequired = false,
        placeholder,
        validators = []
    }: FormFieldParameters) {
        this.asyncValidators = asyncValidators;
        this.columns = columns;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.isLabelVisible = isLabelVisible;
        this.isLabelTooltipVisible = isLabelTooltipVisible;
        this.isRequired = isRequired;
        this.key = key;
        this.placeholder = placeholder;
        this.type = type;
        this.validators = validators;
    }
}

interface FormFieldParameters {
    key: string;
    type: FormFieldType;

    asyncValidators?: FormFieldAsyncValidator[];
    columns?: FormFieldColumn;
    isDisabled?: boolean;
    isHidden?: boolean;
    isLabelVisible?: boolean;
    isLabelTooltipVisible?: boolean;
    isRequired?: boolean;
    placeholder?: string;
    validators?: FormFieldValidator[];
}

export enum FormFieldType {
    Checkbox = 'checkbox',
    Date = 'date',
    Number = 'number',
    Password = 'password',
    Radio = 'radio',
    Select = 'select',
    Text = 'text',
    Textarea = 'textarea'
}
