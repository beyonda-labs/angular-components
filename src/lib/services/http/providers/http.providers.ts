import { EnvironmentProviders, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';

import { ignoreShownErrors } from '../functions/shown-errors';

export function provideBeyHttp(): EnvironmentProviders {
    return makeEnvironmentProviders([provideEnvironmentInitializer(ignoreShownErrors)]);
}
