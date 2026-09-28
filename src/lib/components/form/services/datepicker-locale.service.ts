import { inject, Injectable } from '@angular/core';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { enGbLocale, esLocale } from 'ngx-bootstrap/locale';

@Injectable({
    providedIn: 'root'
})
export class DatepickerLocaleService {
    private readonly bsLocaleService = inject(BsLocaleService);

    private static localesDefined = false;

    static readonly ENGLISH_LOCALE = 'en-gb';
    static readonly SPANISH_LOCALE = 'es';

    constructor() {
        this.defineSupportedLocales();
    }

    getLocale(language?: string | null): string {
        const normalizedLanguage = language?.toLowerCase() ?? DatepickerLocaleService.ENGLISH_LOCALE;

        if (normalizedLanguage.startsWith('es')) {
            return DatepickerLocaleService.SPANISH_LOCALE;
        }

        return DatepickerLocaleService.ENGLISH_LOCALE;
    }

    use(language?: string | null): void {
        this.bsLocaleService.use(this.getLocale(language));
    }

    private defineSupportedLocales(): void {
        if (DatepickerLocaleService.localesDefined) {
            return;
        }

        defineLocale(DatepickerLocaleService.ENGLISH_LOCALE, enGbLocale);
        defineLocale(DatepickerLocaleService.SPANISH_LOCALE, esLocale);
        DatepickerLocaleService.localesDefined = true;
    }
}
