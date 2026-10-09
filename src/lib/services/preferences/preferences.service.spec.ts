import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TestingConfig } from '@testing/models/testing.model';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeStorageService } from '@testing/services/fake-storage.service';

import { SessionUser } from '../session/models/session.model';
import { SessionService } from '../session/session.service';
import { ThemeService } from '../theme/theme.service';
import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG, PreferencesConfig } from './models/preferences.model';
import { PreferencesService } from './preferences.service';

const ACCOUNT_URL = 'https://api.test/api/account';
const LANGUAGE_KEY = 'bey-language';
const USER: SessionUser = { allowedPaths: ['/home'], email: 'ada@example.test', redirectPath: '/home' };

describe('PreferencesService', () => {
    let httpTesting: HttpTestingController;
    let service: PreferencesService;
    let storage: FakeStorageService;
    let translate: TranslateService;

    function setup(testing: TestingConfig = {}, preferences: PreferencesConfig = {}): void {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideBeyTesting(testing),
                { provide: PREFERENCES_CONFIG, useValue: { ...DEFAULT_PREFERENCES_CONFIG, ...preferences } }
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PreferencesService);
        storage = TestBed.inject(FakeStorageService);
        translate = TestBed.inject(TranslateService);
    }

    function tokenWith(payload: Record<string, unknown>): string {
        return `header.${btoa(JSON.stringify({ email: 'ada@example.test', ...payload }))}.signature`;
    }

    beforeEach(() => {
        document.body.classList.remove('dark');
        localStorage.clear();
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('offers the languages of the app, each named in itself', () => {
        setup();

        expect(service.languages).toEqual([
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' }
        ]);
    });

    describe('start', () => {
        it('starts in the language the user chose last, with the default one as the fallback', () => {
            setup({ language: 'fr' });
            storage.set(LANGUAGE_KEY, 'es');

            service.start();

            expect(translate.currentLang).toBe('es');
            expect(translate.getDefaultLang()).toBe('en');
        });

        it('starts in the language of the browser when the user chose none the app offers', () => {
            setup({ language: 'fr' });
            storage.set(LANGUAGE_KEY, 'de');
            jest.spyOn(translate, 'getBrowserLang').mockReturnValue('es');

            service.start();

            expect(translate.currentLang).toBe('es');
        });

        it('starts in the default language when neither the user nor the browser speaks one of the app', () => {
            setup({ language: 'fr' }, { defaultLanguage: 'es' });
            jest.spyOn(translate, 'getBrowserLang').mockReturnValue('de');

            service.start();

            expect(translate.currentLang).toBe('es');
            expect(translate.getDefaultLang()).toBe('es');
        });
    });

    describe('setLanguage', () => {
        it('switches the language and remembers it, without a request while signed out', () => {
            setup();

            service.setLanguage('es');

            expect(translate.currentLang).toBe('es');
            expect(storage.get(LANGUAGE_KEY)).toBe('es');
        });

        it('ignores a language the app does not offer', () => {
            setup();

            service.setLanguage('fr');

            expect(translate.currentLang).toBe('en');
            expect(storage.get(LANGUAGE_KEY)).toBeNull();
        });

        it('saves the language of a signed-in user to the account, and keeps it on the session user', () => {
            setup({ user: USER });

            service.setLanguage('es');
            const request = httpTesting.expectOne(ACCOUNT_URL);
            request.flush({});

            expect(request.request.method).toBe('PUT');
            expect(request.request.body).toEqual({ language: 'es' });
            expect(TestBed.inject(SessionService).user()?.language).toBe('es');
        });

        it('keeps the new language without telling the user when the account cannot save it', () => {
            setup({ user: USER });

            service.setLanguage('es');
            httpTesting.expectOne(ACCOUNT_URL).flush(null, { status: 500, statusText: 'Server Error' });

            expect(translate.currentLang).toBe('es');
            expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
            expect(TestBed.inject(SessionService).user()?.language).toBeUndefined();
        });
    });

    describe('setTheme', () => {
        it('switches the theme, and saves it to the account of a signed-in user', () => {
            setup({ user: USER });

            service.setTheme('dark');
            const request = httpTesting.expectOne(ACCOUNT_URL);
            request.flush({});

            expect(document.body.classList).toContain('dark');
            expect(request.request.body).toEqual({ theme: 'dark' });
        });

        it('switches the theme without a request while signed out', () => {
            setup();

            service.setTheme('dark');

            expect(TestBed.inject(ThemeService).currentTheme).toBe('dark');
        });
    });

    describe('session', () => {
        it('applies and remembers the saved language and theme of the user once the session opens', () => {
            setup();

            TestBed.inject(SessionService).setToken(tokenWith({ language: 'es', theme: 'dark' }));
            TestBed.flushEffects();

            expect(translate.currentLang).toBe('es');
            expect(storage.get(LANGUAGE_KEY)).toBe('es');
            expect(TestBed.inject(ThemeService).currentTheme).toBe('dark');
            expect(localStorage.getItem('bey-theme')).toBe('dark');
        });

        it('applies them again whenever the token changes', () => {
            setup();
            const session = TestBed.inject(SessionService);

            session.setToken(tokenWith({ language: 'es' }));
            TestBed.flushEffects();
            session.setToken(tokenWith({ language: 'en', theme: 'dark' }));
            TestBed.flushEffects();

            expect(translate.currentLang).toBe('en');
            expect(document.body.classList).toContain('dark');
        });

        it('leaves the language and the theme alone for a user who saved none, or saved one the app does not offer', () => {
            setup();

            TestBed.inject(SessionService).setToken(tokenWith({ language: 'fr', theme: 'sepia' }));
            TestBed.flushEffects();

            expect(translate.currentLang).toBe('en');
            expect(storage.get(LANGUAGE_KEY)).toBeNull();
            expect(TestBed.inject(ThemeService).currentTheme).toBe('light');
        });
    });
});
