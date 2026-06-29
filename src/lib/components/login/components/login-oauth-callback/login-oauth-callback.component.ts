import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SESSION_CONFIG } from '../../../../services/session/models/session.model';
import { SessionService } from '../../../../services/session/session.service';

@Component({
    selector: 'bey-login-oauth-callback',
    standalone: true,
    template: ''
})
export class LoginOAuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sessionConfig = inject(SESSION_CONFIG);
    private readonly sessionService = inject(SessionService);

    ngOnInit(): void {
        const parameters = this.route.snapshot.queryParamMap;
        const accessToken = parameters.get('accessToken');
        const refreshToken = parameters.get('refreshToken');
        const error = parameters.get('error');

        if (error || !accessToken || !refreshToken) {
            this.router.navigate([this.sessionConfig.loginRoute]);

            return;
        }

        this.sessionService.setToken(accessToken);
        this.sessionService.setRefreshToken(refreshToken);

        const redirectPath = this.sessionService.user()?.redirectPath;
        this.router.navigate([redirectPath ?? '/']);
    }
}
