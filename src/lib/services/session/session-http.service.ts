import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../environment/models/environment.model';
import { RefreshResponse } from './models/session.model';

@Injectable({
    providedIn: 'root'
})
export class SessionHttpService {
    private readonly environmentConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpClient = inject(HttpClient);

    private readonly baseUrl = this.environmentConfig.accessControlUrl;

    logout(): Observable<void> {
        return this.httpClient.post<void>(`${this.baseUrl}/logout`, null, { withCredentials: true });
    }

    refresh(): Observable<RefreshResponse> {
        return this.httpClient.post<RefreshResponse>(`${this.baseUrl}/refresh`, null, { withCredentials: true });
    }
}
