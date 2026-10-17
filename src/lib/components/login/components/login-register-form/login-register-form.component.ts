import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { PasswordPolicyService } from '../../../../services/password-policy/password-policy.service';
import { FormComponent } from '../../../form/form.component';
import { FormButton, FormButtonType, FormConfig } from '../../../form/models/form.model';
import { FormValue } from '../../../form/models/form-field.model';
import { LoginConfig, RegisterField, RegisterResponse } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { buildRegisterSections, buildRegisterSteps, groupByStep } from './functions/register-form';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent],
    selector: 'bey-login-register-form',
    standalone: true,
    templateUrl: './login-register-form.component.html'
})
export class LoginRegisterFormComponent {
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly passwordPolicyService = inject(PasswordPolicyService);

    readonly config = input.required<LoginConfig>();
    readonly registerFields = input.required<RegisterField[]>();

    readonly verificationRequired = output<void>();

    readonly formConfig = computed(() => this.buildForm(groupByStep(this.registerFields())));

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
            sections: buildRegisterSections(steps, this.passwordPolicyService.policy),
            steps: buildRegisterSteps(steps)
        });
    }

    private register(value: FormValue): void {
        const values = Object.assign({}, ...Object.values(value)) as Record<string, unknown>;

        this.loginHttpService.register(values).subscribe(response => this.registered(response));
    }

    private registered(response: RegisterResponse): void {
        if ('accessToken' in response) {
            this.loginSessionService.open(response);

            return;
        }

        this.verificationRequired.emit();
    }
}
