import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../environment/models/environment.model';
import { SESSION_CONFIG } from './models/session.model';
import { SessionService } from './session.service';

const SESSION_ENDPOINTS = ['login', 'logout', 'refresh', 'register'];
const UNAUTHORIZED_STATUS = 401;

export const sessionInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const config = inject(SESSION_CONFIG);
    const environmentConfig = inject(ENVIRONMENT_CONFIG);
    const router = inject(Router);
    const sessionService = inject(SessionService);

    const isSessionRequest = SESSION_ENDPOINTS.some(
        endpoint => request.url === `${environmentConfig.accessControlUrl}/${endpoint}`
    );

    return next(authorize(request, sessionService.getToken())).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== UNAUTHORIZED_STATUS || isSessionRequest) {
                return throwError(() => error);
            }

            return sessionService.restore().pipe(
                switchMap(isRestored => {
                    if (isRestored) {
                        return next(authorize(request, sessionService.getToken()));
                    }

                    sessionService.clear();
                    router.navigate([config.loginRoute]);

                    return throwError(() => error);
                })
            );
        })
    );
};

function authorize(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
}
