import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormComponent } from '../../../form/form.component';
import { FormPasswordField } from '../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { LoginConfig, LoginProviderConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginProvidersComponent } from '../login-providers/login-providers.component';

interface LoginFormValue {
    login: { email: string | null; password: string | null };
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, LoginProvidersComponent, TranslateModule],
    selector: 'bey-login-form',
    standalone: true,
    templateUrl: './login-form.component.html'
})
export class LoginFormComponent {
    readonly config = input.required<LoginConfig>();
    readonly providers = input.required<LoginProviderConfig[]>();

    readonly formConfig = computed(() => this.buildForm(this.prefix()));
    readonly prefix = computed(() => this.config().prefix);

    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);

    onProvider(provider: LoginProviderConfig): void {
        window.location.href = provider.authUrl;
    }

    private buildForm(prefix: string): FormConfig {
        return new FormConfig({
            buttonLayout: 'stretch',
            prefix,
            sections: [
                new FormSection({
                    key: 'login',
                    isTitleVisible: false,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({
                                    key: 'email',
                                    isRequired: true,
                                    validators: [new FormFieldEmailValidator()]
                                })
                            ]
                        }),
                        new FormRow({ fields: [new FormPasswordField({ key: 'password', isRequired: true })] })
                    ]
                })
            ],
            buttons: [new FormButton({ label: `${prefix}.login.button.login`, type: FormButtonType.Submit })],
            onSubmit: value => this.signIn((value as LoginFormValue).login)
        });
    }

    private signIn({ email, password }: LoginFormValue['login']): void {
        this.loginHttpService
            .login({ email: email ?? '', password: password ?? '' })
            .subscribe(response => this.loginSessionService.open(response));
    }
}
