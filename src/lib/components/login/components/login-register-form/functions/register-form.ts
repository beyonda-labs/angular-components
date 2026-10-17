import { FormDateField } from '../../../../form/models/fields/form-date-field.model';
import { FormNumberField } from '../../../../form/models/fields/form-number-field.model';
import { FormPasswordField, FormPasswordPolicy } from '../../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection, FormStep } from '../../../../form/models/form.model';
import { FormField } from '../../../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../../../form/models/form-field-validator.model';
import { RegisterField } from '../../../models/login.model';

const PASSWORD_FIELD = 'password';
const SECTION_PREFIX = 'register';

export function buildRegisterSections(steps: RegisterField[][], policy: FormPasswordPolicy): FormSection[] {
    return steps.map(
        (fields, index) =>
            new FormSection({
                isTitleVisible: false,
                key: sectionKey(index),
                prefix: SECTION_PREFIX,
                rows: fields.map(field => new FormRow({ fields: [buildField(field, policy)] }))
            })
    );
}

export function buildRegisterSteps(steps: RegisterField[][]): FormStep[] {
    return steps.length > 1
        ? steps.map((_, index) => new FormStep({ key: String(index + 1), sections: [sectionKey(index)] }))
        : [];
}

export function groupByStep(fields: RegisterField[]): RegisterField[][] {
    const steps = new Map<number, RegisterField[]>();

    for (const field of fields) {
        const step = field.step ?? 1;

        steps.set(step, [...(steps.get(step) ?? []), field]);
    }

    return [...steps.keys()].sort((a, b) => a - b).map(step => steps.get(step) ?? []);
}

function buildField(field: RegisterField, policy: FormPasswordPolicy): FormField {
    const base = { key: field.name, isRequired: field.isRequired };

    switch (field.type) {
        case 'email':
            return new FormTextField({ ...base, autocomplete: 'email', validators: [new FormFieldEmailValidator()] });
        case 'password':
            return new FormPasswordField({
                ...base,
                autocomplete: 'new-password',
                policy: field.name === PASSWORD_FIELD ? policy : undefined
            });
        case 'number':
            return new FormNumberField(base);
        case 'date':
            return new FormDateField(base);
        default:
            return new FormTextField(base);
    }
}

function sectionKey(index: number): string {
    return `${SECTION_PREFIX}-${index + 1}`;
}
