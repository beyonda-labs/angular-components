import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SESSION_CONFIG } from '../../../../services/session/models/session.model';
import { LoginSessionService } from '../../services/login-session.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-login-oauth-callback',
    standalone: true,
    template: ''
})
export class LoginOAuthCallbackComponent implements OnInit {
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sessionConfig = inject(SESSION_CONFIG);

    ngOnInit(): void {
        const parameters = this.route.snapshot.queryParamMap;
        const accessToken = parameters.get('accessToken');
        const refreshToken = parameters.get('refreshToken');

        if (parameters.get('error') || !accessToken || !refreshToken) {
            this.router.navigate([this.sessionConfig.loginRoute]);

            return;
        }

        this.loginSessionService.open({ accessToken, refreshToken });
    }
}
