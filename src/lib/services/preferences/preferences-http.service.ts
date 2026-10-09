import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AccountHttpService } from '../account/account-http.service';
import { AccountPreferences, PREFERENCES_CONFIG } from './models/preferences.model';

@Injectable({
    providedIn: 'root'
})
export class PreferencesHttpService {
    private readonly accountHttpService = inject(AccountHttpService);
    private readonly config = inject(PREFERENCES_CONFIG);

    save(preferences: AccountPreferences): Observable<unknown> {
        return this.accountHttpService.updateProfile(this.config.accountUrl, preferences, {
            handleError: ignoreError
        });
    }
}

function ignoreError(): void {}
