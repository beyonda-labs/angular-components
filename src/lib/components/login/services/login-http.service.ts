import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { LoginCredentials, LoginProviderConfig, LoginResponse, RegisterField } from '../models/login.model';

const ignoreError = (): void => undefined;

@Injectable({ providedIn: 'root' })
export class LoginHttpService {
    private readonly envConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    private readonly baseUrl = this.envConfig.accessControlUrl;

    getProviders(): Observable<LoginProviderConfig[]> {
        return this.httpService.get<LoginProviderConfig[]>(`${this.baseUrl}/providers`, { handleError: ignoreError });
    }

    getRegisterFields(): Observable<RegisterField[]> {
        return this.httpService.get<RegisterField[]>(`${this.baseUrl}/register/fields`, { handleError: ignoreError });
    }

    login(credentials: LoginCredentials): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/login`, credentials, { loading: true });
    }

    register(values: Record<string, unknown>): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/register`, values, { loading: true });
    }
}
