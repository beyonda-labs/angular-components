import { InjectionToken } from '@angular/core';

import { AccountProfileUpdate } from '../../account/models/account.model';

export type AccountPreferences = Pick<AccountProfileUpdate, 'language' | 'theme'>;

export interface PreferencesConfig {
    accountUrl?: string;
    defaultLanguage?: string;
    languages?: string[];
}

export interface PreferencesLanguage {
    code: string;
    name: string;
}

export const DEFAULT_PREFERENCES_CONFIG: Required<PreferencesConfig> = {
    accountUrl: '/account',
    defaultLanguage: 'en',
    languages: ['en', 'es']
};

export const LANGUAGE_STORAGE_KEY = 'bey-language';

export const PREFERENCES_CONFIG = new InjectionToken<Required<PreferencesConfig>>('PREFERENCES_CONFIG', {
    factory: () => DEFAULT_PREFERENCES_CONFIG,
    providedIn: 'root'
});
