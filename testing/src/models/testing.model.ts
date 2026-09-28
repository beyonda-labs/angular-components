import { HttpInterceptorFn } from '@angular/common/http';
import { BeyEnvironmentConfig, BeySessionConfig, BeySessionUser } from '@beyonda-labs/angular-components';
import { InterpolatableTranslationObject } from '@ngx-translate/core';

export interface TestingConfig {
    environment?: Partial<BeyEnvironmentConfig>;
    interceptors?: HttpInterceptorFn[];
    language?: string;
    session?: BeySessionConfig;
    token?: string;
    translations?: Record<string, InterpolatableTranslationObject>;
    user?: BeySessionUser;
}
