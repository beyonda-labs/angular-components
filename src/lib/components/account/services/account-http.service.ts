import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { AccountPasswordUpdate, AccountProfile, AccountProfileUpdate, AccountSession } from '../models/account.model';

const PASSWORD_PATH = '/password';

@Injectable({
    providedIn: 'root'
})
export class AccountHttpService {
    private readonly environmentConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    changePassword(baseUrl: string, value: AccountPasswordUpdate, successToast: string): Observable<AccountSession> {
        return this.httpService.put<AccountSession>(this.url(baseUrl, PASSWORD_PATH), value, {
            successToast,
            withCredentials: true
        });
    }

    load(baseUrl: string): Observable<AccountProfile> {
        return this.httpService.get<AccountProfile>(this.url(baseUrl));
    }

    updateProfile(baseUrl: string, value: AccountProfileUpdate, successToast: string): Observable<AccountProfile> {
        return this.httpService.put<AccountProfile>(this.url(baseUrl), value, { successToast });
    }

    private url(baseUrl: string, suffix = ''): string {
        const { baseUrl: origin, webApiPath } = this.environmentConfig;

        return `${origin}${webApiPath}${baseUrl}${suffix}`;
    }
}
