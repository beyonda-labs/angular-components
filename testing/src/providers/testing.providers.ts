import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
    EnvironmentProviders,
    inject,
    makeEnvironmentProviders,
    provideEnvironmentInitializer,
    Provider,
    Type
} from '@angular/core';
import {
    BeyEnvironmentConfig,
    BeyFilePreviewService,
    BeyModalFormService,
    BeyModalService,
    beySessionInterceptor,
    BeySessionService,
    BeySessionUser,
    BeyStorageService,
    BeyToastService,
    provideBeyEnvironment,
    provideBeyHttp,
    provideBeyModal,
    provideBeySession
} from '@beyonda-labs/angular-components';
import { InterpolatableTranslationObject, provideTranslateService, TranslateService } from '@ngx-translate/core';

import { TestingConfig } from '../models/testing.model';
import { FakeFilePreviewService } from '../services/fake-file-preview.service';
import { FakeModalService } from '../services/fake-modal.service';
import { FakeModalFormService } from '../services/fake-modal-form.service';
import { FakeStorageService } from '../services/fake-storage.service';
import { FakeToastService } from '../services/fake-toast.service';

const DEFAULT_ENVIRONMENT: BeyEnvironmentConfig = {
    accessControlUrl: 'https://api.test/auth',
    appName: 'test-app',
    baseUrl: 'https://api.test',
    cookieName: 'test-session',
    webApiPath: '/api'
};
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_TOKEN = 'test-token';

export function provideBeyTesting({
    environment,
    interceptors = [],
    language = DEFAULT_LANGUAGE,
    session,
    token,
    translations = {},
    user
}: TestingConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideHttpClient(withInterceptors([beySessionInterceptor, ...interceptors])),
        provideHttpClientTesting(),
        provideBeyEnvironment({ ...DEFAULT_ENVIRONMENT, ...environment }),
        provideBeyHttp(),
        provideBeyModal(),
        provideBeySession(session),
        provideTranslateService(),
        provideFake(FakeFilePreviewService, BeyFilePreviewService),
        provideFake(FakeModalFormService, BeyModalFormService),
        provideFake(FakeModalService, BeyModalService),
        provideFake(FakeStorageService, BeyStorageService),
        provideFake(FakeToastService, BeyToastService),
        provideEnvironmentInitializer(() => {
            startSession(token, user);
            startTranslations(language, translations);
        })
    ]);
}

function provideFake(fake: Type<unknown>, real: Type<unknown>): Provider[] {
    return [fake, { provide: real, useExisting: fake }];
}

function startSession(token?: string, user?: BeySessionUser): void {
    const sessionService = inject(BeySessionService);

    if (token || user) {
        sessionService.setToken(token ?? DEFAULT_TOKEN);
    }

    if (user) {
        sessionService.setUser(user);
    }
}

function startTranslations(language: string, translations: Record<string, InterpolatableTranslationObject>): void {
    const translateService = inject(TranslateService);

    for (const [translationLanguage, translation] of Object.entries(translations)) {
        translateService.setTranslation(translationLanguage, translation);
    }

    translateService.use(language);
}
