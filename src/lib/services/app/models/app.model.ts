import { HttpInterceptorFn } from '@angular/common/http';

import { EnvironmentConfig } from '../../environment/models/environment.model';
import { PreferencesConfig } from '../../preferences/models/preferences.model';
import { SessionConfig } from '../../session/models/session.model';

export interface AppConfig {
    environment: EnvironmentConfig;

    interceptors?: HttpInterceptorFn[];
    preferences?: PreferencesConfig;
    session?: SessionConfig;
    translationsPath?: string;
}
