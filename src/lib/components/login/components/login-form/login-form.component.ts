import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { FormComponent } from '../../../form/form.component';
import { FormPasswordField } from '../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { unverifiedEmailOf } from '../../functions/login-error';
import { LoginConfig, LoginProviderConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginProvidersComponent } from '../login-providers/login-providers.component';

interface LoginFormValue {
    login: { email: string | null; password: string | null };
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FormComponent, LoginProvidersComponent, TranslateModule],
    selector: 'bey-login-form',
    standalone: true,
    templateUrl: './login-form.component.html'
})
export class LoginFormComponent {
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);

    readonly config = input.required<LoginConfig>();
    readonly providers = input.required<LoginProviderConfig[]>();

    readonly forgotPasswordClick = output<void>();

    readonly forgotPasswordButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.forgotPasswordClick.emit(),
                label: `${this.prefix()}.login.forgot-password`,
                type: ButtonType.LinkSecondary
            })
    );
    readonly formConfig = computed(() => this.buildForm(this.prefix()));
    readonly isVerificationResent = signal(false);
    readonly prefix = computed(() => this.config().prefix);
    readonly resendButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.resendVerification(),
                customClass: 'w-100 d-block ms-0 justify-content-center',
                customStyles: 'width: 100%',
                label: `${this.prefix()}.login.unverified.resend`,
                type: ButtonType.Secondary
            })
    );
    readonly resentMessage = computed(() => `${this.prefix()}.login.unverified.sent`);
    readonly unverifiedEmail = signal<string | null>(null);
    readonly unverifiedMessage = computed(() => `${this.prefix()}.login.unverified.message`);

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
                                    autocomplete: 'email',
                                    key: 'email',
                                    isRequired: true,
                                    validators: [new FormFieldEmailValidator()]
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    autocomplete: 'current-password',
                                    key: 'password',
                                    isRequired: true
                                })
                            ]
                        })
                    ]
                })
            ],
            buttons: [new FormButton({ label: `${prefix}.login.button.login`, type: FormButtonType.Submit })],
            onSubmit: value => this.signIn((value as LoginFormValue).login)
        });
    }

    private resendVerification(): void {
        const email = this.unverifiedEmail() ?? '';

        this.isVerificationResent.set(false);
        this.loginHttpService.resendVerification(email).subscribe(() => this.isVerificationResent.set(true));
    }

    private signIn({ email, password }: LoginFormValue['login']): void {
        const typedEmail = email ?? '';

        this.unverifiedEmail.set(null);
        this.isVerificationResent.set(false);
        this.loginHttpService.login({ email: typedEmail, password: password ?? '' }).subscribe({
            error: (error: unknown) => this.unverifiedEmail.set(unverifiedEmailOf(error, typedEmail)),
            next: response => this.loginSessionService.open(response)
        });
    }
}
