import { HttpInterceptorFn } from '@angular/common/http';

import { EnvironmentConfig } from '../../environment/models/environment.model';
import { SessionConfig } from '../../session/models/session.model';

export interface AppConfig {
    environment: EnvironmentConfig;

    interceptors?: HttpInterceptorFn[];
    session?: SessionConfig;
    translationsPath?: string;
}
