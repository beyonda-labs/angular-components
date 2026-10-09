import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormComponent } from '../../../form/form.component';
import { LoginConfig } from '../../models/login.model';
import { LoginAccountFormService } from '../../services/login-account-form.service';
import { LoginHttpService } from '../../services/login-http.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, TranslateModule],
    selector: 'bey-login-forgot-password',
    standalone: true,
    templateUrl: './login-forgot-password.component.html'
})
export class LoginForgotPasswordComponent {
    private readonly loginAccountFormService = inject(LoginAccountFormService);
    private readonly loginHttpService = inject(LoginHttpService);

    readonly config = input.required<LoginConfig>();

    readonly formConfig = computed(() =>
        this.loginAccountFormService.buildForgotPassword(this.prefix(), email => this.send(email))
    );
    readonly intro = computed(() => `${this.prefix()}.forgot-password.intro`);
    readonly isSent = signal(false);
    readonly prefix = computed(() => this.config().prefix);
    readonly sentMessage = computed(() => `${this.prefix()}.forgot-password.sent`);

    private send(email: string): void {
        this.isSent.set(false);
        this.loginHttpService.forgotPassword(email).subscribe(() => this.isSent.set(true));
    }
}
