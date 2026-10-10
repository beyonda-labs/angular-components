import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';

import { SESSION_CONFIG } from './models/session.model';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = route => {
    const config = inject(SESSION_CONFIG);
    const router = inject(Router);
    const sessionService = inject(SessionService);

    const decide = (): boolean | UrlTree => {
        const user = sessionService.getUser();

        if (!sessionService.isAuthenticated() || !user) {
            return router.createUrlTree([config.loginRoute]);
        }

        const targetPath = `/${route.routeConfig?.path ?? ''}`;
        const isAllowed = user.allowedPaths.some(allowed => targetPath.startsWith(allowed));

        if (!isAllowed) {
            return router.createUrlTree([user.redirectPath]);
        }

        return true;
    };

    if (sessionService.isAuthenticated()) {
        return decide();
    }

    return sessionService.restore().pipe(map(() => decide()));
};
