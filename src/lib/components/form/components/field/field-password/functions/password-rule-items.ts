import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

import { PasswordPolicy } from '../../../../../../services/password-policy/models/password-policy.model';
import { PasswordRuleCheck, PasswordRuleItem } from '../../../../models/fields/form-password-field.model';

const RULE_KEY_PREFIX = 'angular-components.form.password-field.policy.';

export function toRuleItem(
    { isMet, rule }: PasswordRuleCheck,
    { minLength }: PasswordPolicy,
    isFlagged: boolean
): PasswordRuleItem {
    return {
        icon: isMet ? faCircleCheck : faCircle,
        isInvalid: isFlagged && !isMet,
        isMet,
        label: `${RULE_KEY_PREFIX}${rule}`,
        parameters: { min: minLength },
        rule,
        status: `${RULE_KEY_PREFIX}${isMet ? 'met' : 'unmet'}`
    };
}
