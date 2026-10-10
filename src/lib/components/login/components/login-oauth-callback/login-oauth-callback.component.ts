import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { SESSION_CONFIG } from '../../../../services/session/models/session.model';
import { SessionService } from '../../../../services/session/session.service';
import { LoginSessionService } from '../../services/login-session.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-login-oauth-callback',
    standalone: true,
    template: ''
})
export class LoginOAuthCallbackComponent {
    private readonly loginSessionService = inject(LoginSessionService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly sessionConfig = inject(SESSION_CONFIG);
    private readonly sessionService = inject(SessionService);

    constructor() {
        const isRefused = this.route.snapshot.queryParamMap.has('error');

        (isRefused ? of(false) : this.sessionService.restore())
            .pipe(takeUntilDestroyed())
            .subscribe(isRestored => this.land(isRestored));
    }

    private land(isRestored: boolean): void {
        if (isRestored) {
            this.loginSessionService.enter();

            return;
        }

        this.router.navigate([this.sessionConfig.loginRoute]);
    }
}
