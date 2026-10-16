import { Signal } from '@angular/core';

import { PasswordPolicy } from '../../../../services/password-policy/models/password-policy.model';
import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export type FormPasswordPolicy = PasswordPolicy | Signal<PasswordPolicy>;

export type PasswordRule = 'digit' | 'length' | 'lowercase' | 'symbol' | 'uppercase';

export interface PasswordRuleCheck {
    isMet: boolean;
    rule: PasswordRule;
}

export class FormPasswordField extends FormField {
    isToggleShown: boolean;

    policy?: FormPasswordPolicy;

    constructor({ policy, isToggleShown = true, ...base }: FormPasswordFieldParameters) {
        super({ ...base, type: FormFieldType.Password });

        this.isToggleShown = isToggleShown;
        this.policy = policy;
    }
}

export interface FormPasswordFieldParameters extends FormFieldBaseParameters {
    isToggleShown?: boolean;
    policy?: FormPasswordPolicy;
}
