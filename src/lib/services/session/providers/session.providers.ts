import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { DEFAULT_SESSION_CONFIG, SESSION_CONFIG, SessionConfig } from '../models/session.model';

export function provideBeySession(config?: SessionConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: SESSION_CONFIG,
            useValue: { ...DEFAULT_SESSION_CONFIG, ...config }
        }
    ]);
}
