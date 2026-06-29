import { InjectionToken } from '@angular/core';

export interface SessionConfig {
    loginRoute?: string;
    refreshTokenKey?: string;
    tokenKey?: string;
    userKey?: string;
}

export interface SessionUser {
    allowedPaths: string[];
    email: string;
    redirectPath: string;

    app?: unknown;
    name?: string;
    roles?: string[];
    surname?: string;
}

export const DEFAULT_SESSION_CONFIG: Required<SessionConfig> = {
    loginRoute: '/login',
    refreshTokenKey: 'bey_refresh_token',
    tokenKey: 'bey_token',
    userKey: 'bey_user'
};

export const SESSION_CONFIG = new InjectionToken<Required<SessionConfig>>('SESSION_CONFIG', {
    factory: () => DEFAULT_SESSION_CONFIG,
    providedIn: 'root'
});
