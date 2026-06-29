import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';

export function provideBeyModal(): EnvironmentProviders {
    return makeEnvironmentProviders([importProvidersFrom(ModalModule.forRoot())]);
}