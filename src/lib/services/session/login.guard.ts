import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionService } from './session.service';

export const loginGuard: CanActivateFn = () => {
    const router = inject(Router);
    const sessionService = inject(SessionService);

    if (!sessionService.isAuthenticated()) {
        return true;
    }

    const user = sessionService.getUser();
    const redirectPath = user?.redirectPath ?? '/';

    return router.createUrlTree([redirectPath]);
};
