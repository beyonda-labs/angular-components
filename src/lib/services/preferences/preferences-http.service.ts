import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../environment/models/environment.model';
import { HttpService } from '../http/http.service';
import { AccountPreferences, PREFERENCES_CONFIG } from './models/preferences.model';

@Injectable({
    providedIn: 'root'
})
export class PreferencesHttpService {
    private readonly config = inject(PREFERENCES_CONFIG);
    private readonly environmentConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    save(preferences: AccountPreferences): Observable<unknown> {
        const { baseUrl, webApiPath } = this.environmentConfig;

        return this.httpService.put(`${baseUrl}${webApiPath}${this.config.accountUrl}`, preferences, {
            handleError: ignoreError
        });
    }
}

function ignoreError(): void {}
