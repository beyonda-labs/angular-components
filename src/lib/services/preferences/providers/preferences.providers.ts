import { EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';

import { DEFAULT_PREFERENCES_CONFIG, PREFERENCES_CONFIG, PreferencesConfig } from '../models/preferences.model';
import { PreferencesService } from '../preferences.service';

export function provideBeyPreferences(config?: PreferencesConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: PREFERENCES_CONFIG,
            useValue: { ...DEFAULT_PREFERENCES_CONFIG, ...config }
        },
        provideEnvironmentInitializer(() => inject(PreferencesService).start())
    ]);
}
