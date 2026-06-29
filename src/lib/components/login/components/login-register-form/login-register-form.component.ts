import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../../../services/session/session.service';
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

type RegisterFormValue = { register: Record<string, unknown> };

@Component({
    imports: [FormComponent],
    selector: 'bey-login-register-form',
    standalone: true,
    templateUrl: './login-register-form.component.html'
})
export class LoginRegisterFormComponent implements OnInit {
    @Input({ required: true }) config!: LoginConfig;
    @Input({ required: true }) registerFields!: RegisterField[];

    formConfig!: FormConfig;
    currentStep = 0;

    private steps: RegisterField[][] = [];
    private accumulatedValues: Record<string, unknown> = {};

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    ngOnInit(): void {
        this.steps = this.groupByStep(this.registerFields);
        if (this.steps.length > 0) {
            this.buildStepForm();
        }
    }

    private groupByStep(fields: RegisterField[]): RegisterField[][] {
        const map = fields.reduce<Record<number, RegisterField[]>>((accumulator, field) => {
            const step = field.step ?? 1;
            if (!accumulator[step]) {
                accumulator[step] = [];
            }

            accumulator[step].push(field);

            return accumulator;
        }, {});

        return Object.keys(map)
            .map(Number)
            .sort((a, b) => a - b)
            .map(k => map[k]);
    }

    private buildStepForm(): void {
        const isFirst = this.currentStep === 0;
        const isLast = this.currentStep === this.steps.length - 1;
        const stepFields = this.steps[this.currentStep];

        const buttons: FormButton[] = [];

        if (!isFirst) {
            buttons.push(
                new FormButton({
                    label: `${this.config.translatePrefix}.register.button.back`,
                    type: FormButtonType.Previous,
                    action: () => this.prevStep(),
                    customClass: 'ms-0'
                })
            );
        }

        buttons.push(
            new FormButton({
                label: `${this.config.translatePrefix}.register.button.${isLast ? 'register' : 'next'}`,
                type: FormButtonType.Submit,
                customClass: 'w-100 d-block ms-0 justify-content-center',
                customStyles: 'width: 100%'
            })
        );

        this.formConfig = new FormConfig({
            i18nPrefix: this.config.translatePrefix,
            sections: [
                new FormSection({
                    key: 'register',
                    isTitleVisible: false,
                    rows: stepFields.map(
                        field =>
                            new FormRow({
                                fields: [this.buildFormField(field)]
                            })
                    )
                })
            ],
            buttons,
            onFormGroupAdded: formGroup => {
                const stepValues = Object.fromEntries(
                    stepFields.map(f => [f.name, this.accumulatedValues[f.name] ?? null])
                );
                formGroup.patchValue({ register: stepValues }, { emitEvent: false });
            },
            onSubmit: (value: unknown) => {
                const { register } = value as RegisterFormValue;
                this.accumulatedValues = { ...this.accumulatedValues, ...register };

                if (isLast) {
                    this.submitRegistration();
                } else {
                    this.currentStep++;
                    this.buildStepForm();
                    this.cdr.markForCheck();
                }
            }
        });
    }

    private buildFormField(field: RegisterField): FormField {
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

    private prevStep(): void {
        this.currentStep--;
        this.buildStepForm();
        this.cdr.markForCheck();
    }

    private submitRegistration(): void {
        this.loginHttpService.register(this.accumulatedValues).subscribe(response => {
            this.sessionService.setToken(response.accessToken);
            this.sessionService.setRefreshToken(response.refreshToken);
            const redirectPath = this.sessionService.user()?.redirectPath;
            if (redirectPath) {
                this.router.navigate([redirectPath]);
            }
        });
    }
}
