import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SessionService } from '../../../../services/session/session.service';
import { FormComponent } from '../../../form/form.component';
import { FormPasswordField } from '../../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../../form/models/form.model';
import { FormFieldEmailValidator } from '../../../form/models/form-field-validator.model';
import { LoginConfig, LoginProviderConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginProvidersComponent } from '../login-providers/login-providers.component';

interface LoginFormValue {
    login: { email: string | null; password: string | null };
}

@Component({
    imports: [FormComponent, LoginProvidersComponent, TranslateModule],
    selector: 'bey-login-form',
    standalone: true,
    templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {
    @Input({ required: true }) config!: LoginConfig;
    @Input({ required: true }) providers!: LoginProviderConfig[];

    formConfig!: FormConfig;

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    get prefix(): string {
        return this.config.translatePrefix;
    }

    ngOnInit(): void {
        this.formConfig = new FormConfig({
            i18nPrefix: this.config.translatePrefix,
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
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    key: 'password',
                                    isRequired: true
                                })
                            ]
                        })
                    ]
                })
            ],
            buttons: [
                new FormButton({
                    label: `${this.config.translatePrefix}.login.button.login`,
                    type: FormButtonType.Submit,
                    customClass: 'w-100 d-block ms-0 justify-content-center',
                    customStyles: 'width: 100%'
                })
            ],
            onSubmit: (value: unknown) => {
                const { login } = value as LoginFormValue;

                this.loginHttpService.login(login.email ?? '', login.password ?? '').subscribe(response => {
                    this.sessionService.setToken(response.accessToken);
                    this.sessionService.setRefreshToken(response.refreshToken);
                    const redirectPath = this.sessionService.user()?.redirectPath;
                    if (redirectPath) {
                        this.router.navigate([redirectPath]);
                    }
                });
            }
        });
    }

    onProvider(provider: LoginProviderConfig): void {
        window.location.href = provider.authUrl;
    }
}
