import { FormFieldOption } from './form-field.model';

export type FormFieldStates = ReadonlyMap<string, FormFieldState>;

export interface FormFieldState {
    excludedValues: string[];
    isDisabled: boolean;
    isHidden: boolean;
    isRequired: boolean;
    isValid: boolean;
    options: FormFieldOption[];
}
