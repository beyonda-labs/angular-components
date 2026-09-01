import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../environment/models/environment.model';
import { SESSION_CONFIG } from './models/session.model';
import { SessionService } from './session.service';

const UNAUTHORIZED_STATUS = 401;

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

let isRefreshing = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

// This state is module-level (shared across every request app-wide, deliberately — see below), which
// also means it leaks across test cases unless reset. Not used by the interceptor itself.
export function resetSessionInterceptorStateForTesting(): void {
    isRefreshing = false;
    refreshedToken$.next(null);
}

export const sessionInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const config = inject(SESSION_CONFIG);
    const environmentConfig = inject(ENVIRONMENT_CONFIG);
    const httpClient = inject(HttpClient);
    const router = inject(Router);
    const sessionService = inject(SessionService);

    const refreshUrl = `${environmentConfig.accessControlUrl}/refresh`;
    const isRefreshRequest = request.url === refreshUrl;

    const token = sessionService.getToken();

    const authorizedRequest = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

    const logout = () => {
        sessionService.clear();
        router.navigate([config.loginRoute]);
    };

    return next(authorizedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== UNAUTHORIZED_STATUS || isRefreshRequest) {
                return throwError(() => error);
            }

            const refreshToken = sessionService.getRefreshToken();

            if (!refreshToken) {
                logout();

                return throwError(() => error);
            }

            if (!isRefreshing) {
                isRefreshing = true;
                refreshedToken$.next(null);

                httpClient.post<RefreshResponse>(refreshUrl, { refreshToken }).subscribe({
                    next: response => {
                        sessionService.setToken(response.accessToken);
                        sessionService.setRefreshToken(response.refreshToken);
                        isRefreshing = false;
                        refreshedToken$.next(response.accessToken);
                    },
                    error: () => {
                        isRefreshing = false;
                        logout();
                        refreshedToken$.next(null);
                    }
                });
            }

            return refreshedToken$.pipe(
                filter(accessToken => accessToken !== null || !isRefreshing),
                take(1),
                switchMap(accessToken => {
                    if (!accessToken) {
                        return throwError(() => error);
                    }

                    const retriedRequest = request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });

                    return next(retriedRequest);
                })
            );
        })
    );
};
