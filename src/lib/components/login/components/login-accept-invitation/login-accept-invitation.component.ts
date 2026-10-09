import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FormComponent } from '../../../form/form.component';
import { LoginAutofocusDirective } from '../../directives/login-autofocus.directive';
import { isTokenInvalid } from '../../functions/login-error';
import {
    AcceptInvitationRequest,
    Invitation,
    InvitationStatus,
    LINK_TOKEN_PARAMETER,
    LinkErrorReason,
    LoginConfig
} from '../../models/login.model';
import { LoginAccountFormService } from '../../services/login-account-form.service';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginLinkErrorComponent } from '../login-link-error/login-link-error.component';
import { LoginShellComponent } from '../login-shell/login-shell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, LoginAutofocusDirective, LoginLinkErrorComponent, LoginShellComponent, TranslateModule],
    selector: 'bey-login-accept-invitation',
    standalone: true,
    styleUrls: ['../../login-page.styles.css'],
    templateUrl: './login-accept-invitation.component.html'
})
export class LoginAcceptInvitationComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly loginAccountFormService = inject(LoginAccountFormService);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly route = inject(ActivatedRoute);

    readonly config = input.required<LoginConfig>();

    readonly errorReason = computed<LinkErrorReason | null>(() => {
        const status = this.status();

        return status === 'failed' || status === 'invalid' ? status : null;
    });
    readonly formConfig = computed(() => {
        const invitation = this.invitation();

        return invitation
            ? this.loginAccountFormService.buildAcceptInvitation(this.prefix(), invitation, details =>
                  this.accept(details)
              )
            : null;
    });
    readonly intro = computed(() => `${this.prefix()}.accept-invitation.intro`);
    readonly introParameters = computed(() => ({ email: this.invitation()?.email ?? '' }));
    readonly invitation = signal<Invitation | null>(null);
    readonly loadingMessage = computed(() =>
        this.status() === 'loading' ? `${this.prefix()}.accept-invitation.loading` : ''
    );
    readonly prefix = computed(() => this.config().prefix);
    readonly status = signal<InvitationStatus>('loading');
    readonly title = computed(
        () => `${this.prefix()}.title.${this.status() === 'invalid' ? 'invalid-link' : 'accept-invitation'}`
    );

    private readonly token = this.route.snapshot.queryParamMap.get(LINK_TOKEN_PARAMETER);

    constructor() {
        this.load();
    }

    load(): void {
        if (!this.token) {
            this.status.set('invalid');

            return;
        }

        this.status.set('loading');
        this.loginHttpService
            .getInvitation(this.token)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                error: (error: unknown) => this.status.set(isTokenInvalid(error) ? 'invalid' : 'failed'),
                next: invitation => {
                    this.invitation.set(invitation);
                    this.status.set('ready');
                }
            });
    }

    private accept(details: Omit<AcceptInvitationRequest, 'token'>): void {
        this.loginHttpService.acceptInvitation({ ...details, token: this.token ?? '' }).subscribe({
            error: (error: unknown) => {
                if (isTokenInvalid(error)) {
                    this.status.set('invalid');
                }
            },
            next: response => this.loginSessionService.open(response)
        });
    }
}
