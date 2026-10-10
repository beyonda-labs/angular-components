import { signal } from '@angular/core';
import { FormControl } from '@angular/forms';

import { PasswordPolicy } from '../../../services/password-policy/models/password-policy.model';
import { PasswordRule } from '../models/fields/form-password-field.model';
import { checkPasswordRules, passwordPolicyValidator, resolvePasswordPolicy } from './password-rules';

const STRICT = new PasswordPolicy({
    isDigitRequired: true,
    isLowercaseRequired: true,
    isSymbolRequired: true,
    isUppercaseRequired: true
});

function unmetRules(policy: PasswordPolicy, password: string): PasswordRule[] {
    return checkPasswordRules(policy, password)
        .filter(check => !check.isMet)
        .map(check => check.rule);
}

function validate(policy: PasswordPolicy, value: unknown): ReturnType<ReturnType<typeof passwordPolicyValidator>> {
    return passwordPolicyValidator(policy)(new FormControl(value));
}

describe('password rules', () => {
    describe('checkPasswordRules', () => {
        it('checks only the length under the library defaults', () => {
            expect(checkPasswordRules(new PasswordPolicy(), 'short')).toEqual([{ isMet: false, rule: 'length' }]);
            expect(checkPasswordRules(new PasswordPolicy(), 'long enough')).toEqual([{ isMet: true, rule: 'length' }]);
        });

        it('checks every rule the policy turns on, the length first and then in the order of the policy', () => {
            expect(checkPasswordRules(STRICT, '').map(check => check.rule)).toEqual([
                'length',
                'uppercase',
                'lowercase',
                'digit',
                'symbol'
            ]);
        });

        it('checks only the rules that are on', () => {
            const policy = new PasswordPolicy({ isDigitRequired: true, minLength: 4 });

            expect(checkPasswordRules(policy, 'abcd')).toEqual([
                { isMet: true, rule: 'length' },
                { isMet: false, rule: 'digit' }
            ]);
        });

        it('marks each rule met by the character class it asks for', () => {
            expect(unmetRules(STRICT, 'abcdefgh')).toEqual(['uppercase', 'digit', 'symbol']);
            expect(unmetRules(STRICT, 'ABCDEFGH')).toEqual(['lowercase', 'digit', 'symbol']);
            expect(unmetRules(STRICT, '12345678')).toEqual(['uppercase', 'lowercase', 'symbol']);
            expect(unmetRules(STRICT, '!!!!!!!!')).toEqual(['uppercase', 'lowercase', 'digit']);
            expect(unmetRules(STRICT, 'Abcdef1!')).toEqual([]);
        });

        it('knows letters, digits and symbols beyond ASCII', () => {
            expect(unmetRules(STRICT, 'É')).toEqual(['length', 'lowercase', 'digit', 'symbol']);
            expect(unmetRules(STRICT, 'ñ')).toEqual(['length', 'uppercase', 'digit', 'symbol']);
            expect(unmetRules(STRICT, '٣')).toEqual(['length', 'uppercase', 'lowercase', 'symbol']);
            expect(unmetRules(STRICT, '¿')).toEqual(['length', 'uppercase', 'lowercase', 'digit']);
        });

        it('does not take a space for a symbol', () => {
            expect(unmetRules(new PasswordPolicy({ isSymbolRequired: true }), 'pass word')).toEqual(['symbol']);
        });

        it('counts the length in characters, not in UTF-16 units', () => {
            const policy = new PasswordPolicy({ minLength: 4 });

            expect(unmetRules(policy, '😀😀')).toEqual(['length']);
            expect(unmetRules(policy, '😀😀😀😀')).toEqual([]);
        });
    });

    describe('passwordPolicyValidator', () => {
        it('lets an empty value through, for the required validator to judge', () => {
            expect(validate(STRICT, '')).toBeNull();
            expect(validate(STRICT, null)).toBeNull();
        });

        it('fails with the unmet rules while any of them is unmet', () => {
            expect(validate(STRICT, 'abc')).toEqual({
                passwordPolicy: { unmet: ['length', 'uppercase', 'digit', 'symbol'] }
            });
            expect(validate(STRICT, 'Abcdef1!')).toBeNull();
        });

        it('fails with a message beyond the maximum length, counted in characters', () => {
            const policy = new PasswordPolicy({ maxLength: 10 });

            expect(validate(policy, 'a'.repeat(10))).toBeNull();
            expect(validate(policy, '😀'.repeat(10))).toBeNull();
            expect(validate(policy, 'a'.repeat(11))).toEqual({
                passwordTooLong: {
                    messageKey: 'angular-components.form.password-field.policy.too-long',
                    messageParameters: { max: 10 }
                }
            });
        });

        it('reads a policy given as a signal each time it validates', () => {
            const policy = signal(new PasswordPolicy());
            const control = new FormControl('abcdefgh');
            const validator = passwordPolicyValidator(policy);

            expect(validator(control)).toBeNull();

            policy.set(STRICT);

            expect(validator(control)).toEqual({ passwordPolicy: { unmet: ['uppercase', 'digit', 'symbol'] } });
        });
    });

    describe('resolvePasswordPolicy', () => {
        it('reads a policy given as a value or as a signal', () => {
            expect(resolvePasswordPolicy(STRICT)).toBe(STRICT);
            expect(resolvePasswordPolicy(signal(STRICT))).toBe(STRICT);
        });
    });
});
