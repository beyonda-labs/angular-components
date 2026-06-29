import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SESSION_CONFIG } from './models/session.model';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = route => {
    const config = inject(SESSION_CONFIG);
    const router = inject(Router);
    const sessionService = inject(SessionService);

    if (!sessionService.isAuthenticated()) {
        return router.createUrlTree([config.loginRoute]);
    }

    const user = sessionService.getUser();

    if (!user) {
        return router.createUrlTree([config.loginRoute]);
    }

    const targetPath = `/${route.routeConfig?.path ?? ''}`;
    const isAllowed = user.allowedPaths.some(allowed => targetPath.startsWith(allowed));

    if (!isAllowed) {
        return router.createUrlTree([user.redirectPath]);
    }

    return true;
};
