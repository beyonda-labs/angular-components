import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { StyleGuideTranslationService } from './style-guide-translation.service';

const BUNDLE_PATH = 'assets/angular-components/i18n-style-guide/angular-components-style-guide';

describe('StyleGuideTranslationService', () => {
    let httpTesting: HttpTestingController;
    let loaded: jest.Mock;
    let service: StyleGuideTranslationService;
    let translate: TranslateService;

    function bundle(title: string): Record<string, unknown> {
        return { 'angular-components-style-guide': { title } };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(StyleGuideTranslationService);
        translate = TestBed.inject(TranslateService);
        loaded = jest.fn();
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('merges the bundle of the current language into the translations the app already has', () => {
        translate.setTranslation('en', { app: { title: 'My app' } });
        translate.use('en');

        service.loadBundles().subscribe(loaded);
        httpTesting.expectOne(`${BUNDLE_PATH}.en.json`).flush(bundle('Style guide'));

        expect(translate.instant('angular-components-style-guide.title')).toBe('Style guide');
        expect(translate.instant('app.title')).toBe('My app');
        expect(loaded.mock.calls).toEqual([['en']]);
    });

    it('merges the bundle of every language the app switches to', () => {
        translate.use('en');
        service.loadBundles().subscribe(loaded);
        httpTesting.expectOne(`${BUNDLE_PATH}.en.json`).flush(bundle('Style guide'));

        translate.use('es');
        httpTesting.expectOne(`${BUNDLE_PATH}.es.json`).flush(bundle('Guía de estilo'));

        expect(translate.instant('angular-components-style-guide.title')).toBe('Guía de estilo');
        expect(loaded.mock.calls).toEqual([['en'], ['es']]);
    });

    it('goes on without the bundle when it cannot be loaded', () => {
        translate.use('en');

        service.loadBundles().subscribe(loaded);
        httpTesting.expectOne(`${BUNDLE_PATH}.en.json`).flush(null, { status: 404, statusText: 'Not Found' });

        expect(loaded.mock.calls).toEqual([['en']]);
    });

    it('waits for the first language when the app has not set one yet', () => {
        service.loadBundles().subscribe(loaded);

        expect(loaded).toHaveBeenCalledTimes(1);

        translate.use('en');
        httpTesting.expectOne(`${BUNDLE_PATH}.en.json`).flush(bundle('Style guide'));

        expect(translate.instant('angular-components-style-guide.title')).toBe('Style guide');
    });
});
