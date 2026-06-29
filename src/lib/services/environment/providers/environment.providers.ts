import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../models/environment.model';

export function provideBeyEnvironment(config: EnvironmentConfig): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: ENVIRONMENT_CONFIG, useValue: config }
    ]);
}
