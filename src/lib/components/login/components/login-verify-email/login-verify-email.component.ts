import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { LoginAutofocusDirective } from '../../directives/login-autofocus.directive';
import { isTokenInvalid } from '../../functions/login-error';
import { EmailVerificationStatus, LINK_TOKEN_PARAMETER, LinkErrorReason, LoginConfig } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginLinkErrorComponent } from '../login-link-error/login-link-error.component';
import { LoginShellComponent } from '../login-shell/login-shell.component';

const STATUS_MESSAGES: Record<EmailVerificationStatus, string> = {
    failed: '',
    invalid: '',
    verified: 'verify-email.success',
    verifying: 'verify-email.progress'
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoginAutofocusDirective, LoginLinkErrorComponent, LoginShellComponent, TranslateModule],
    selector: 'bey-login-verify-email',
    standalone: true,
    styleUrls: ['../../login-page.styles.css'],
    templateUrl: './login-verify-email.component.html'
})
export class LoginVerifyEmailComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly route = inject(ActivatedRoute);

    readonly config = input.required<LoginConfig>();

    readonly errorReason = computed<LinkErrorReason | null>(() => {
        const status = this.status();

        return status === 'failed' || status === 'invalid' ? status : null;
    });
    readonly status = signal<EmailVerificationStatus>('verifying');
    readonly statusMessage = computed(() => {
        const message = STATUS_MESSAGES[this.status()];

        return message ? `${this.config().prefix}.${message}` : '';
    });
    readonly title = computed(
        () => `${this.config().prefix}.title.${this.status() === 'invalid' ? 'invalid-link' : 'verify-email'}`
    );

    private readonly token = this.route.snapshot.queryParamMap.get(LINK_TOKEN_PARAMETER);

    constructor() {
        this.verify();
    }

    verify(): void {
        if (!this.token) {
            this.status.set('invalid');

            return;
        }

        this.status.set('verifying');
        this.loginHttpService
            .verifyEmail(this.token)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                error: (error: unknown) => this.status.set(isTokenInvalid(error) ? 'invalid' : 'failed'),
                next: response => {
                    this.status.set('verified');
                    this.loginSessionService.open(response);
                }
            });
    }
}
