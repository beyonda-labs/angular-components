import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormComponent } from '../../../form/form.component';
import { LoginAutofocusDirective } from '../../directives/login-autofocus.directive';
import { isTokenInvalid } from '../../functions/login-error';
import { LINK_TOKEN_PARAMETER, LoginConfig, NewPassword } from '../../models/login.model';
import { LoginAccountFormService } from '../../services/login-account-form.service';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginLinkErrorComponent } from '../login-link-error/login-link-error.component';
import { LoginShellComponent } from '../login-shell/login-shell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, LoginAutofocusDirective, LoginLinkErrorComponent, LoginShellComponent],
    selector: 'bey-login-reset-password',
    standalone: true,
    styleUrls: ['../../login-page.styles.css'],
    templateUrl: './login-reset-password.component.html'
})
export class LoginResetPasswordComponent {
    private readonly loginAccountFormService = inject(LoginAccountFormService);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly route = inject(ActivatedRoute);

    readonly config = input.required<LoginConfig>();

    readonly formConfig = computed(() =>
        this.loginAccountFormService.buildResetPassword(this.config().prefix, password => this.save(password))
    );
    readonly isLinkInvalid = signal(!this.route.snapshot.queryParamMap.get(LINK_TOKEN_PARAMETER));
    readonly title = computed(
        () => `${this.config().prefix}.title.${this.isLinkInvalid() ? 'invalid-link' : 'reset-password'}`
    );

    private readonly token = this.route.snapshot.queryParamMap.get(LINK_TOKEN_PARAMETER) ?? '';

    private save(password: NewPassword): void {
        this.loginHttpService.resetPassword({ ...password, token: this.token }).subscribe({
            error: (error: unknown) => this.isLinkInvalid.set(isTokenInvalid(error)),
            next: response => this.loginSessionService.open(response)
        });
    }
}
