import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
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

        const targetPath = matchedPath(route);
        const isAllowed = user.allowedPaths.some(allowed => isWithin(targetPath, allowed));

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

function isWithin(path: string, allowed: string): boolean {
    return path === allowed || path.startsWith(allowed.endsWith('/') ? allowed : `${allowed}/`);
}

function matchedPath(route: ActivatedRouteSnapshot): string {
    const segments = route.pathFromRoot
        .flatMap(snapshot => (snapshot.routeConfig?.path ?? '').split('/'))
        .filter(segment => segment !== '');

    return `/${segments.join('/')}`;
}
