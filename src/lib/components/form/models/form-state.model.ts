import { FormValue } from './form-field.model';

export interface FormState {
    isDirty: boolean;
    isValid: boolean;
    value: FormValue;
}
