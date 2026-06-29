import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { SESSION_CONFIG } from './models/session.model';
import { SessionService } from './session.service';

const UNAUTHORIZED_STATUS = 401;

export const sessionInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const config = inject(SESSION_CONFIG);
    const router = inject(Router);
    const sessionService = inject(SessionService);

    const token = sessionService.getToken();

    const authorizedRequest = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

    return next(authorizedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === UNAUTHORIZED_STATUS) {
                sessionService.clear();
                router.navigate([config.loginRoute]);
            }

            return throwError(() => error);
        })
    );
};
