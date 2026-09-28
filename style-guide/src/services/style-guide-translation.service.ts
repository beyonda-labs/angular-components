import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService, TranslationObject } from '@ngx-translate/core';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';

const BUNDLE_PATH = 'assets/angular-components/i18n-style-guide/angular-components-style-guide';

@Injectable({
    providedIn: 'root'
})
export class StyleGuideTranslationService {
    private readonly httpClient = inject(HttpClient);
    private readonly translateService = inject(TranslateService);

    loadBundles(): Observable<string> {
        return this.translateService.onLangChange.pipe(
            map(event => event.lang),
            startWith(this.translateService.currentLang || this.translateService.defaultLang),
            switchMap(language => (language ? this.loadBundle(language) : of(language)))
        );
    }

    private loadBundle(language: string): Observable<string> {
        return this.httpClient.get<TranslationObject>(`${BUNDLE_PATH}.${language}.json`).pipe(
            map(bundle => {
                this.translateService.setTranslation(language, bundle, true);

                return language;
            }),
            catchError(() => of(language))
        );
    }
}
