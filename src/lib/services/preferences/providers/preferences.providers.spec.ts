import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG } from '../models/preferences.model';
import { provideBeyPreferences } from './preferences.providers';

describe('provideBeyPreferences', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('fills in the defaults of what it is not given', () => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), provideBeyTesting(), provideBeyPreferences({ defaultLanguage: 'es' })]
        });

        expect(TestBed.inject(PREFERENCES_CONFIG)).toEqual({ ...DEFAULT_PREFERENCES_CONFIG, defaultLanguage: 'es' });
    });

    it('starts the app in its language as soon as the app starts', () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideBeyTesting({ language: 'fr' }),
                provideBeyPreferences({ defaultLanguage: 'es', languages: ['es'] })
            ]
        });

        expect(TestBed.inject(TranslateService).currentLang).toBe('es');
    });
});
