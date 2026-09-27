import { InjectionToken } from '@angular/core';

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>('ENVIRONMENT_CONFIG');

export interface EnvironmentConfig {
    accessControlUrl: string;
    appName: string;
    baseUrl: string;
    cookieName: string;
    webApiPath: string;
}
