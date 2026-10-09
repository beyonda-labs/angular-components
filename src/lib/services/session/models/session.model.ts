import { InjectionToken } from '@angular/core';

export interface RefreshResponse {
    accessToken: string;
}

export interface SessionConfig {
    loginRoute?: string;
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
    loginRoute: '/login'
};

export const SESSION_CONFIG = new InjectionToken<Required<SessionConfig>>('SESSION_CONFIG', {
    factory: () => DEFAULT_SESSION_CONFIG,
    providedIn: 'root'
});
