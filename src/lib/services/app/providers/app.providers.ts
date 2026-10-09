import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { provideBeyModal } from '../../../components/modal/providers/modal.providers';
import { provideBeyToast } from '../../../components/toast/providers/toast.providers';
import { provideBeyEnvironment } from '../../environment/providers/environment.providers';
import { provideBeyHttp } from '../../http/providers/http.providers';
import { provideBeyPreferences } from '../../preferences/providers/preferences.providers';
import { provideBeySession } from '../../session/providers/session.providers';
import { sessionInterceptor } from '../../session/session.interceptor';
import { AppConfig } from '../models/app.model';

const DEFAULT_TRANSLATIONS_PATH = './assets/i18n/';
const TRANSLATIONS_SUFFIX = '.json';

export function provideBeyApp({
    environment,
    interceptors = [],
    preferences,
    session,
    translationsPath = DEFAULT_TRANSLATIONS_PATH
}: AppConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideHttpClient(withInterceptors([sessionInterceptor, ...interceptors])),
        provideBeyEnvironment(environment),
        provideBeyHttp(),
        provideBeyModal(),
        provideBeySession(session),
        provideBeyToast(),
        provideTranslateService({
            loader: {
                provide: TranslateLoader,
                useFactory: (httpClient: HttpClient) =>
                    new TranslateHttpLoader(httpClient, translationsPath, TRANSLATIONS_SUFFIX),
                deps: [HttpClient]
            }
        }),
        provideBeyPreferences(preferences)
    ]);
}
