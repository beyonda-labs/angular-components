import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { ComponentFixture } from '@angular/core/testing';
import {
    BeyEnvironmentConfig,
    BeyFormSection,
    BeySessionConfig,
    BeySessionUser
} from '@beyonda-labs/angular-components';
import { InterpolatableTranslationObject } from '@ngx-translate/core';

export type FormFieldsSource = BeyFormSection[] | { sections: BeyFormSection[] } | undefined;

export type QueryScope = ComponentFixture<unknown> | Element;

export interface SearchRequest {
    request: HttpRequest<unknown>;
}

export interface TestingConfig {
    environment?: Partial<BeyEnvironmentConfig>;
    interceptors?: HttpInterceptorFn[];
    language?: string;
    session?: BeySessionConfig;
    token?: string;
    translations?: Record<string, InterpolatableTranslationObject>;
    user?: BeySessionUser;
}

export interface FakeFormHandleParameters<TValue = unknown> {
    isDirty?: boolean;
    value?: TValue;
}
