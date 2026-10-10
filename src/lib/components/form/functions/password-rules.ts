import { isSignal } from '@angular/core';
import { ValidationErrors, ValidatorFn } from '@angular/forms';

import { PasswordPolicy } from '../../../services/password-policy/models/password-policy.model';
import { FormPasswordPolicy, PasswordRule, PasswordRuleCheck } from '../models/fields/form-password-field.model';

const DIGIT = /\p{Nd}/u;
const LOWERCASE = /\p{Ll}/u;
const SYMBOL = /[^\p{L}\p{N}\s]/u;
const TOO_LONG_KEY = 'angular-components.form.password-field.policy.too-long';
const UPPERCASE = /\p{Lu}/u;

export function checkPasswordRules(policy: PasswordPolicy, password: string): PasswordRuleCheck[] {
    return [
        { isMet: lengthOf(password) >= policy.minLength, rule: 'length' },
        ...characterRules(policy)
            .filter(([, isRequired]) => isRequired)
            .map(([rule, , pattern]): PasswordRuleCheck => ({ isMet: pattern.test(password), rule }))
    ];
}

export function passwordPolicyValidator(policy: FormPasswordPolicy): ValidatorFn {
    return control => {
        const password = typeof control.value === 'string' ? control.value : '';

        if (password === '') {
            return null;
        }

        const current = resolvePasswordPolicy(policy);
        const unmet = checkPasswordRules(current, password)
            .filter(check => !check.isMet)
            .map(check => check.rule);
        const errors: ValidationErrors = {
            ...(unmet.length > 0 && { passwordPolicy: { unmet } }),
            ...(lengthOf(password) > current.maxLength && {
                passwordTooLong: { messageKey: TOO_LONG_KEY, messageParameters: { max: current.maxLength } }
            })
        };

        return Object.keys(errors).length > 0 ? errors : null;
    };
}

export function resolvePasswordPolicy(policy: FormPasswordPolicy): PasswordPolicy {
    return isSignal(policy) ? policy() : policy;
}

function characterRules(policy: PasswordPolicy): [PasswordRule, boolean, RegExp][] {
    return [
        ['uppercase', policy.isUppercaseRequired, UPPERCASE],
        ['lowercase', policy.isLowercaseRequired, LOWERCASE],
        ['digit', policy.isDigitRequired, DIGIT],
        ['symbol', policy.isSymbolRequired, SYMBOL]
    ];
}

function lengthOf(password: string): number {
    return [...password].length;
}
