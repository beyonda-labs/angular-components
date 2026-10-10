import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../../services/session/session.service';
import { LoginResponse } from '../models/login.model';

@Injectable({ providedIn: 'root' })
export class LoginSessionService {
    private readonly router = inject(Router);
    private readonly sessionService = inject(SessionService);

    enter(): void {
        this.router.navigate([this.sessionService.user()?.redirectPath || '/']);
    }

    open({ accessToken }: LoginResponse): void {
        this.sessionService.setToken(accessToken);
        this.enter();
    }
}
