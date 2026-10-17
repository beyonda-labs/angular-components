import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormField } from '../../../models/form-field.model';

export function hasPasswordPolicy(field: FormField): boolean {
    return field instanceof FormPasswordField && field.policy !== undefined;
}
