import { effect, inject, Injectable, untracked } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SessionUser } from '../session/models/session.model';
import { SessionService } from '../session/session.service';
import { StorageService } from '../session/storage.service';
import { Theme, ThemeService } from '../theme/theme.service';
import { languageName } from './functions/language-name';
import {
    AccountPreferences,
    LANGUAGE_STORAGE_KEY,
    PREFERENCES_CONFIG,
    PreferencesLanguage
} from './models/preferences.model';
import { PreferencesHttpService } from './preferences-http.service';

const THEMES: ReadonlySet<string> = new Set(['dark', 'light']);

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {
    private readonly config = inject(PREFERENCES_CONFIG);
    private readonly preferencesHttpService = inject(PreferencesHttpService);
    private readonly sessionService = inject(SessionService);
    private readonly storageService = inject(StorageService);
    private readonly themeService = inject(ThemeService);
    private readonly translateService = inject(TranslateService);

    readonly languages: readonly PreferencesLanguage[] = this.config.languages.map(code => ({
        code,
        name: languageName(code)
    }));

    constructor() {
        effect(() => {
            if (this.sessionService.token()) {
                untracked(() => this.applySaved(this.sessionService.getUser()));
            }
        });
    }

    setLanguage(language: string): void {
        if (!this.isSupported(language)) {
            return;
        }

        this.useLanguage(language);
        this.save({ language });
    }

    setTheme(theme: Theme): void {
        this.themeService.setTheme(theme);
        this.save({ theme });
    }

    start(): void {
        this.translateService.setDefaultLang(this.config.defaultLanguage);
        this.translateService.use(this.startLanguage());
    }

    private applySaved(user: SessionUser | null): void {
        const language = user?.language;
        const theme = user?.theme;

        if (this.isSupported(language)) {
            this.useLanguage(language);
        }

        if (isTheme(theme)) {
            this.themeService.setTheme(theme);
        }
    }

    private isSupported(language?: string | null): language is string {
        return typeof language === 'string' && this.config.languages.includes(language);
    }

    private keepSaved(preferences: AccountPreferences): void {
        const user = this.sessionService.getUser();

        if (user) {
            this.sessionService.setUser({ ...user, ...preferences });
        }
    }

    private readRememberedLanguage(): string | null {
        try {
            return this.storageService.get<string>(LANGUAGE_STORAGE_KEY);
        } catch {
            return null;
        }
    }

    private remember(language: string): boolean {
        try {
            this.storageService.set(LANGUAGE_STORAGE_KEY, language);

            return true;
        } catch {
            return false;
        }
    }

    private save(preferences: AccountPreferences): void {
        if (!this.sessionService.isAuthenticated()) {
            return;
        }

        this.preferencesHttpService.save(preferences).subscribe({
            error: ignoreError,
            next: () => this.keepSaved(preferences)
        });
    }

    private startLanguage(): string {
        return (
            [this.readRememberedLanguage(), this.translateService.getBrowserLang()].find(language =>
                this.isSupported(language)
            ) ?? this.config.defaultLanguage
        );
    }

    private useLanguage(language: string): void {
        this.translateService.use(language);
        this.remember(language);
    }
}

function ignoreError(): void {}

function isTheme(value?: string): value is Theme {
    return value !== undefined && THEMES.has(value);
}
