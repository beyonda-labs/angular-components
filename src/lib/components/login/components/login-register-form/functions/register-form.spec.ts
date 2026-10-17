import { PasswordPolicy } from '../../../../../services/password-policy/models/password-policy.model';
import { FormDateField } from '../../../../form/models/fields/form-date-field.model';
import { FormNumberField } from '../../../../form/models/fields/form-number-field.model';
import { FormPasswordField } from '../../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../../form/models/fields/form-text-field.model';
import { FormSection } from '../../../../form/models/form.model';
import { FormField } from '../../../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../../../form/models/form-field-validator.model';
import { RegisterField } from '../../../models/login.model';
import { buildRegisterSections, buildRegisterSteps, groupByStep } from './register-form';

const POLICY = new PasswordPolicy({ isDigitRequired: true });

function fieldsOf(section: FormSection): FormField[] {
    return section.rows.flatMap(row => row.fields);
}

describe('groupByStep', () => {
    it('groups the fields by step in the order of the steps, the fields without one in the first', () => {
        const fields: RegisterField[] = [
            { name: 'email', type: 'email', step: 2 },
            { name: 'name', type: 'text' },
            { name: 'password', type: 'password', step: 2 },
            { name: 'birthday', type: 'date', step: 1 }
        ];

        expect(groupByStep(fields).map(step => step.map(field => field.name))).toEqual([
            ['name', 'birthday'],
            ['email', 'password']
        ]);
    });
});

describe('buildRegisterSections', () => {
    it('builds one untitled section per step, keyed by its position, one field per row', () => {
        const sections = buildRegisterSections(
            [[{ name: 'name', type: 'text' }], [{ isRequired: true, name: 'age', type: 'number' }]],
            POLICY
        );

        expect(sections.map(({ isTitleVisible, key, prefix }) => ({ isTitleVisible, key, prefix }))).toEqual([
            { isTitleVisible: false, key: 'register-1', prefix: 'register' },
            { isTitleVisible: false, key: 'register-2', prefix: 'register' }
        ]);
        expect(sections[1].rows.map(row => row.fields.length)).toEqual([1]);
        expect(fieldsOf(sections[1])[0]).toBeInstanceOf(FormNumberField);
        expect(fieldsOf(sections[1])[0].isRequired).toBe(true);
    });

    it('builds the field of each type, an email checked as one and a date as a date', () => {
        const [section] = buildRegisterSections(
            [
                [
                    { name: 'email', type: 'email' },
                    { name: 'birthday', type: 'date' },
                    { name: 'nickname', type: 'text' }
                ]
            ],
            POLICY
        );
        const [email, birthday, nickname] = fieldsOf(section);

        expect(email).toBeInstanceOf(FormTextField);
        expect(email.autocomplete).toBe('email');
        expect(email.validators[0]).toBeInstanceOf(FormFieldEmailValidator);
        expect(birthday).toBeInstanceOf(FormDateField);
        expect(nickname).toBeInstanceOf(FormTextField);
    });

    it('gives the policy only to the password field, both new passwords to the browser', () => {
        const [section] = buildRegisterSections(
            [
                [
                    { name: 'password', type: 'password' },
                    { name: 'password2', type: 'password' }
                ]
            ],
            POLICY
        );
        const [password, repeated] = fieldsOf(section) as FormPasswordField[];

        expect([password.policy, repeated.policy]).toEqual([POLICY, undefined]);
        expect([password.autocomplete, repeated.autocomplete]).toEqual(['new-password', 'new-password']);
    });
});

describe('buildRegisterSteps', () => {
    it('makes one step per section when there are several, and none for a single one', () => {
        const steps = buildRegisterSteps([[{ name: 'name', type: 'text' }], [{ name: 'email', type: 'email' }]]);

        expect(steps.map(({ key, sections }) => ({ key, sections }))).toEqual([
            { key: '1', sections: ['register-1'] },
            { key: '2', sections: ['register-2'] }
        ]);
        expect(buildRegisterSteps([[{ name: 'name', type: 'text' }]])).toEqual([]);
    });
});
