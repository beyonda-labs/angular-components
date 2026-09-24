import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../../services/session/session.service';
import { LoginResponse } from '../models/login.model';

@Injectable({ providedIn: 'root' })
export class LoginSessionService {
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    open({ accessToken, refreshToken }: LoginResponse): void {
        this.sessionService.setToken(accessToken);
        this.sessionService.setRefreshToken(refreshToken);
        this.router.navigate([this.sessionService.user()?.redirectPath || '/']);
    }
}
