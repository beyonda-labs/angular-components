import { Signal } from '@angular/core';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PasswordPolicy } from '../../../../services/password-policy/models/password-policy.model';
import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export type FormPasswordPolicy = PasswordPolicy | Signal<PasswordPolicy>;

export type PasswordRule = 'digit' | 'length' | 'lowercase' | 'symbol' | 'uppercase';

export interface PasswordRuleCheck {
    isMet: boolean;
    rule: PasswordRule;
}

export interface PasswordRuleItem {
    icon: IconDefinition;
    isInvalid: boolean;
    isMet: boolean;
    label: string;
    parameters: Record<string, unknown>;
    rule: PasswordRule;
    status: string;
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
