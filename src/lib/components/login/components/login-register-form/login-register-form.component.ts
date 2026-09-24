import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { FormComponent } from '../../../form/form.component';
import { FormDateField } from '../../../form/models/fields/form-date-field.model';
import { FormNumberField } from '../../../form/models/fields/form-number-field.model';
import { FormPasswordField } from '../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../../form/models/form.model';
import { FormField } from '../../../form/models/form-field.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { LoginConfig, RegisterField } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';

type RegisterValues = Record<string, unknown>;

interface RegisterFormValue {
    register: RegisterValues;
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

    readonly steps = computed(() => groupByStep(this.registerFields()));
    readonly currentStep = linkedSignal({ source: this.steps, computation: () => 0 });
    readonly forms = computed(() => {
        const steps = this.steps();
        const index = this.currentStep();

        return steps.length > 0 ? [this.buildStepForm(steps[index], index === 0, index === steps.length - 1)] : [];
    });

    private readonly values = signal<RegisterValues>({});

    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);

    private buildStepForm(fields: RegisterField[], isFirst: boolean, isLast: boolean): FormConfig {
        const prefix = this.config().translatePrefix;
        const buttons = [
            new FormButton({
                label: `${prefix}.register.button.${isLast ? 'register' : 'next'}`,
                type: FormButtonType.Submit,
                customClass: 'w-100 d-block ms-0 justify-content-center',
                customStyles: 'width: 100%'
            })
        ];

        if (!isFirst) {
            buttons.unshift(
                new FormButton({
                    label: `${prefix}.register.button.back`,
                    type: FormButtonType.Previous,
                    action: () => this.currentStep.update(step => step - 1),
                    customClass: 'ms-0'
                })
            );
        }

        return new FormConfig({
            i18nPrefix: prefix,
            sections: [
                new FormSection({
                    key: 'register',
                    isTitleVisible: false,
                    rows: fields.map(field => new FormRow({ fields: [buildField(field)] }))
                })
            ],
            buttons,
            onFormGroupAdded: formGroup => {
                const values = this.values();

                formGroup.patchValue(
                    { register: Object.fromEntries(fields.map(field => [field.name, values[field.name] ?? null])) },
                    { emitEvent: false }
                );
            },
            onSubmit: value => this.submitStep((value as RegisterFormValue).register, isLast)
        });
    }

    private submitStep(stepValues: RegisterValues, isLast: boolean): void {
        this.values.update(values => ({ ...values, ...stepValues }));

        if (isLast) {
            this.loginHttpService
                .register(this.values())
                .subscribe(response => this.loginSessionService.open(response));

            return;
        }

        this.currentStep.update(step => step + 1);
    }
}
