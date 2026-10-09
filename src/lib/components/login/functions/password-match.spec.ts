import { FormControl, FormGroup } from '@angular/forms';

import { passwordsMatchValidator } from './password-match';

describe('password-match', () => {
    function buildGroup(password: string, password2: string): FormGroup {
        return new FormGroup({
            password: new FormControl(password),
            password2: new FormControl(password2, passwordsMatchValidator('demo.passwords-not-match'))
        });
    }

    it('refuses a confirmation that differs from the password, with the given message', () => {
        const group = buildGroup('secret', 'other');

        group.get('password2')?.updateValueAndValidity();

        expect(group.get('password2')?.errors).toEqual({
            passwordsNotMatch: { messageKey: 'demo.passwords-not-match' }
        });
    });

    it('accepts a matching confirmation and leaves an empty one to the required validator', () => {
        const matching = buildGroup('secret', 'secret');
        const empty = buildGroup('secret', '');

        matching.get('password2')?.updateValueAndValidity();
        empty.get('password2')?.updateValueAndValidity();

        expect(matching.get('password2')?.errors).toBeNull();
        expect(empty.get('password2')?.errors).toBeNull();
    });
});
