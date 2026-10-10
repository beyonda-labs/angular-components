import { Signal } from '@angular/core';

import { FormFieldAsyncValidator, FormFieldValidator } from './form-field-validator.model';

export enum FormFieldType {
    Autocomplete = 'autocomplete',
    Checkbox = 'checkbox',
    CheckboxGroup = 'checkboxGroup',
    Chips = 'chips',
    Date = 'date',
    File = 'file',
    Info = 'info',
    List = 'list',
    Number = 'number',
    Password = 'password',
    Radio = 'radio',
    Select = 'select',
    Text = 'text',
    Textarea = 'textarea',
    TextVariable = 'textVariable'
}

export type FormFieldColumn = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type FormRule<T> = T | Signal<T> | ((value: FormValue) => T);

export type FormValue = Record<string, Record<string, unknown>>;

export interface FormFieldOption {
    label: string;
    value: string;

    badge?: string;
    isDisabled?: boolean;
}

export abstract class FormField {
    asyncValidators: FormFieldAsyncValidator[];
    columns: FormFieldColumn;
    isDisabled: FormRule<boolean>;
    isHidden: FormRule<boolean>;
    isLabelTooltipVisible: boolean;
    isLabelVisible: boolean;
    isRequired: FormRule<boolean>;
    key: string;
    type: FormFieldType;
    validators: FormFieldValidator[];

    autocomplete?: string;
    hint?: string;
    label?: string;
    placeholder?: string;

    constructor({
        key,
        type,

        asyncValidators = [],
        autocomplete,
        columns = 12,
        hint,
        isDisabled = false,
        isHidden = false,
        isLabelTooltipVisible = false,
        isLabelVisible = true,
        isRequired = false,
        label,
        placeholder,
        validators = []
    }: FormFieldParameters) {
        this.asyncValidators = asyncValidators;
        this.autocomplete = autocomplete;
        this.columns = columns;
        this.hint = hint;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.isLabelTooltipVisible = isLabelTooltipVisible;
        this.isLabelVisible = isLabelVisible;
        this.isRequired = isRequired;
        this.key = key;
        this.label = label;
        this.placeholder = placeholder;
        this.type = type;
        this.validators = validators;
    }
}

export interface FormFieldBaseParameters {
    key: string;

    asyncValidators?: FormFieldAsyncValidator[];
    autocomplete?: string;
    columns?: FormFieldColumn;
    hint?: string;
    isDisabled?: FormRule<boolean>;
    isHidden?: FormRule<boolean>;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    isRequired?: FormRule<boolean>;
    label?: string;
    placeholder?: string;
    validators?: FormFieldValidator[];
}

export interface FormFieldParameters extends FormFieldBaseParameters {
    type: FormFieldType;
}
