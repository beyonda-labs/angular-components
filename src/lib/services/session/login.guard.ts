import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { SessionService } from './session.service';

export const loginGuard: CanActivateFn = () => {
    const router = inject(Router);
    const sessionService = inject(SessionService);
    const redirect = () => router.createUrlTree([sessionService.getUser()?.redirectPath ?? '/']);

    if (sessionService.isAuthenticated()) {
        return redirect();
    }

    return sessionService.restore().pipe(map(isRestored => (isRestored ? redirect() : true)));
};
