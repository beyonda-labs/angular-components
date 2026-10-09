import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { SESSION_CONFIG } from '../../../../services/session/models/session.model';
import { AccountLinkFlow, LinkErrorReason, LOGIN_VIEW_PARAMETER, LoginConfig } from '../../models/login.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, RouterLink, TranslateModule],
    selector: 'bey-login-link-error',
    standalone: true,
    templateUrl: './login-link-error.component.html'
})
export class LoginLinkErrorComponent {
    private readonly sessionConfig = inject(SESSION_CONFIG);

    readonly config = input.required<LoginConfig>();
    readonly flow = input.required<AccountLinkFlow>();
    readonly reason = input.required<LinkErrorReason>();

    readonly retryClick = output<void>();

    readonly backLabel = computed(() => `${this.prefix()}.back-to-sign-in`);
    readonly forgotPasswordQuery = { [LOGIN_VIEW_PARAMETER]: 'forgot-password' };
    readonly hint = computed(() => (this.reason() === 'invalid' ? `${this.prefix()}.${this.flow()}.invalid-hint` : ''));
    readonly isLinkRequestOffered = computed(() => this.reason() === 'invalid' && this.flow() === 'reset-password');
    readonly isRetryOffered = computed(() => this.reason() === 'failed');
    readonly loginRoute = this.sessionConfig.loginRoute;
    readonly message = computed(() => `${this.prefix()}.link-error.${this.reason()}`);
    readonly prefix = computed(() => this.config().prefix);
    readonly requestLinkLabel = computed(() => `${this.prefix()}.link-error.request-new-link`);
    readonly retryButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.retryClick.emit(),
                customClass: 'w-100 d-block ms-0 justify-content-center',
                customStyles: 'width: 100%',
                label: `${this.prefix()}.link-error.retry`,
                type: ButtonType.Primary
            })
    );
}
