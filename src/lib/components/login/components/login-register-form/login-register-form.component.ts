import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { FormComponent } from '../../../form/form.component';
import { FormDateField } from '../../../form/models/fields/form-date-field.model';
import { FormNumberField } from '../../../form/models/fields/form-number-field.model';
import { FormPasswordField } from '../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import {
    FormButton,
    FormButtonType,
    FormConfig,
    FormRow,
    FormSection,
    FormStep
} from '../../../form/models/form.model';
import { FormField, FormValue } from '../../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { LoginConfig, RegisterField } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';

const SECTION_PREFIX = 'register';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent],
    selector: 'bey-login-register-form',
    standalone: true,
    templateUrl: './login-register-form.component.html'
})
export class LoginRegisterFormComponent {
    readonly config = input.required<LoginConfig>();
    readonly registerFields = input.required<RegisterField[]>();

    readonly formConfig = computed(() => this.buildForm(groupByStep(this.registerFields())));

    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);

    private buildForm(steps: RegisterField[][]): FormConfig | null {
        if (steps.length === 0) {
            return null;
        }

        const { prefix } = this.config();

        return new FormConfig({
            buttonLayout: 'stretch',
            buttons: [new FormButton({ label: `${prefix}.register.button.register`, type: FormButtonType.Submit })],
            onSubmit: value => this.register(value as FormValue),
            prefix,
            sections: steps.map(
                (fields, index) =>
                    new FormSection({
                        isTitleVisible: false,
                        key: sectionKey(index),
                        prefix: SECTION_PREFIX,
                        rows: fields.map(field => new FormRow({ fields: [buildField(field)] }))
                    })
            ),
            steps:
                steps.length > 1
                    ? steps.map((_, index) => new FormStep({ key: String(index + 1), sections: [sectionKey(index)] }))
                    : []
        });
    }

    private register(value: FormValue): void {
        const values = Object.assign({}, ...Object.values(value)) as Record<string, unknown>;

        this.loginHttpService.register(values).subscribe(response => this.loginSessionService.open(response));
    }
}

function buildField(field: RegisterField): FormField {
    const base = { key: field.name, isRequired: field.required };

    switch (field.type) {
        case 'email':
            return new FormTextField({ ...base, validators: [new FormFieldEmailValidator()] });
        case 'password':
            return new FormPasswordField(base);
        case 'number':
            return new FormNumberField(base);
        case 'date':
            return new FormDateField(base);
        default:
            return new FormTextField(base);
    }
}

function groupByStep(fields: RegisterField[]): RegisterField[][] {
    const steps = new Map<number, RegisterField[]>();

    for (const field of fields) {
        const step = field.step ?? 1;

        steps.set(step, [...(steps.get(step) ?? []), field]);
    }

    return [...steps.keys()].sort((a, b) => a - b).map(step => steps.get(step) ?? []);
}

function sectionKey(index: number): string {
    return `${SECTION_PREFIX}-${index + 1}`;
}
