import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ModalService } from '../../../components/modal/services/modal.service';
import { ToastService } from '../../../components/toast/services/toast.service';
import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../../environment/models/environment.model';
import { HttpService } from '../../http/http.service';
import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG } from '../../preferences/models/preferences.model';
import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG } from '../../session/models/session.model';
import { SessionService } from '../../session/session.service';
import { AppConfig } from '../models/app.model';
import { provideBeyApp } from './app.providers';

describe('provideBeyApp', () => {
    const environment: EnvironmentConfig = {
        accessControlUrl: 'https://auth.test',
        appName: 'test-app',
        baseUrl: 'https://api.test',
        cookieName: 'test-session',
        webApiPath: '/api'
    };

    let httpTesting: HttpTestingController;

    function setup(overrides: Partial<AppConfig> = {}): void {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), provideBeyApp({ environment, ...overrides }), provideHttpClientTesting()]
        });
        httpTesting = TestBed.inject(HttpTestingController);
    }

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        httpTesting.match(request => request.url.endsWith('.json')).forEach(request => request.flush({}));
        httpTesting.verify();
    });

    it('provides the environment, and the session and the preferences with their defaults filled in', () => {
        setup({ preferences: { languages: ['en'] }, session: { loginRoute: '/sign-in' } });

        expect(TestBed.inject(ENVIRONMENT_CONFIG)).toBe(environment);
        expect(TestBed.inject(SESSION_CONFIG)).toEqual({ ...DEFAULT_SESSION_CONFIG, loginRoute: '/sign-in' });
        expect(TestBed.inject(PREFERENCES_CONFIG)).toEqual({ ...DEFAULT_PREFERENCES_CONFIG, languages: ['en'] });
    });

    it('sends every request with the session token, through the extra interceptors after it', () => {
        const seenAuthorization: (null | string)[] = [];
        const tagInterceptor: HttpInterceptorFn = (request, next) => {
            if (request.url === '/api/items') {
                seenAuthorization.push(request.headers.get('Authorization'));
            }

            return next(request.clone({ setHeaders: { 'X-App': 'test-app' } }));
        };

        setup({ interceptors: [tagInterceptor] });
        TestBed.inject(SessionService).setToken('session-token');

        TestBed.inject(HttpClient).get('/api/items').subscribe();
        const { headers } = httpTesting.expectOne('/api/items').request;

        expect(headers.get('Authorization')).toBe('Bearer session-token');
        expect(headers.get('X-App')).toBe('test-app');
        expect(seenAuthorization).toEqual(['Bearer session-token']);
    });

    it('raises nothing for a failed request the HTTP service already reported', fakeAsync(() => {
        const handleError = jest.fn();

        setup();
        TestBed.inject(HttpService).get('/api/items', { handleError }).subscribe();
        httpTesting.expectOne('/api/items').flush(null, { status: 500, statusText: 'Server Error' });

        expect(() => flush()).not.toThrow();
        expect(handleError).toHaveBeenCalledTimes(1);
    }));

    it('starts in the language of the browser, loaded from ./assets/i18n/ by default', () => {
        setup();
        const translate = TestBed.inject(TranslateService);

        httpTesting.expectOne('./assets/i18n/en.json').flush({ greeting: 'Hello' });

        expect(translate.currentLang).toBe('en');
        expect(translate.instant('greeting')).toBe('Hello');
    });

    it('starts in the default language when the browser speaks none of the app, loaded from the path it is given', () => {
        setup({ preferences: { defaultLanguage: 'es', languages: ['es'] }, translationsPath: '/i18n/' });
        const translate = TestBed.inject(TranslateService);

        httpTesting.expectOne('/i18n/es.json').flush({ greeting: 'Hola' });

        expect(translate.currentLang).toBe('es');
        expect(translate.getDefaultLang()).toBe('es');
        expect(translate.instant('greeting')).toBe('Hola');
    });

    it('leaves the modal and toast services ready to use', () => {
        setup();

        expect(() => TestBed.inject(ModalService)).not.toThrow();
        expect(() => TestBed.inject(ToastService)).not.toThrow();
    });
});
