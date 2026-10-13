import { HttpInterceptorFn } from '@angular/common/http';
import { ComponentFixture } from '@angular/core/testing';
import { BeyEnvironmentConfig, BeySessionConfig, BeySessionUser } from '@beyonda-labs/angular-components';
import { InterpolatableTranslationObject } from '@ngx-translate/core';

export type QueryScope = ComponentFixture<unknown> | Element;

export interface TestingConfig {
    environment?: Partial<BeyEnvironmentConfig>;
    interceptors?: HttpInterceptorFn[];
    language?: string;
    session?: BeySessionConfig;
    token?: string;
    translations?: Record<string, InterpolatableTranslationObject>;
    user?: BeySessionUser;
}
