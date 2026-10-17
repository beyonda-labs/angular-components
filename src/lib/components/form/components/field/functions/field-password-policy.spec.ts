import { PasswordPolicy } from '../../../../../services/password-policy/models/password-policy.model';
import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormTextField } from '../../../models/fields/form-text-field.model';
import { hasPasswordPolicy } from './field-password-policy';

describe('hasPasswordPolicy', () => {
    it('is true only for a password field with a policy', () => {
        expect(hasPasswordPolicy(new FormPasswordField({ key: 'password', policy: new PasswordPolicy() }))).toBe(true);
        expect(hasPasswordPolicy(new FormPasswordField({ key: 'password' }))).toBe(false);
        expect(hasPasswordPolicy(new FormTextField({ key: 'name' }))).toBe(false);
    });
});
