import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

import { PasswordPolicy } from '../../../../../../services/password-policy/models/password-policy.model';
import { toRuleItem } from './password-rule-items';

const POLICY = new PasswordPolicy({ minLength: 12 });

describe('toRuleItem', () => {
    it('shows a met rule as checked, never flagged, with the minimum length for its text', () => {
        expect(toRuleItem({ isMet: true, rule: 'length' }, POLICY, true)).toEqual({
            icon: faCircleCheck,
            isInvalid: false,
            isMet: true,
            label: 'angular-components.form.password-field.policy.length',
            parameters: { min: 12 },
            rule: 'length',
            status: 'angular-components.form.password-field.policy.met'
        });
    });

    it('flags an unmet rule only when the field is flagged', () => {
        const flagged = toRuleItem({ isMet: false, rule: 'digit' }, POLICY, true);
        const quiet = toRuleItem({ isMet: false, rule: 'digit' }, POLICY, false);

        expect([flagged.icon, flagged.isInvalid, flagged.status]).toEqual([
            faCircle,
            true,
            'angular-components.form.password-field.policy.unmet'
        ]);
        expect(quiet.isInvalid).toBe(false);
    });
});
