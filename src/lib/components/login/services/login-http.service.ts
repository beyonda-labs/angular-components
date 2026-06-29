import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { LoginProviderConfig, LoginResponse, RegisterField } from '../models/login.model';

@Injectable({ providedIn: 'root' })
export class LoginHttpService {
    private readonly envConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    getProviders(): Observable<LoginProviderConfig[]> {
        return new Observable(observer => {
            this.httpService.get<LoginProviderConfig[]>(`${this.envConfig.accessControlUrl}/providers`, {
                onSuccess: result => {
                    observer.next(result as LoginProviderConfig[]);
                    observer.complete();
                },
                handleError: () => {
                    observer.next([]);
                    observer.complete();
                }
            });
        });
    }

    getRegisterFields(): Observable<RegisterField[]> {
        return new Observable(observer => {
            this.httpService.get<RegisterField[]>(`${this.envConfig.accessControlUrl}/register/fields`, {
                onSuccess: result => {
                    observer.next(result as RegisterField[]);
                    observer.complete();
                },
                handleError: () => {
                    observer.next([]);
                    observer.complete();
                }
            });
        });
    }

    login(email: string, password: string): Observable<LoginResponse> {
        return new Observable(observer => {
            this.httpService.post<LoginResponse>(
                `${this.envConfig.accessControlUrl}/login`,
                { email, password },
                {
                    loading: true,
                    onSuccess: result => {
                        observer.next(result as LoginResponse);
                        observer.complete();
                    }
                }
            );
        });
    }

    register(values: Record<string, unknown>): Observable<LoginResponse> {
        return new Observable(observer => {
            this.httpService.post<LoginResponse>(`${this.envConfig.accessControlUrl}/register`, values, {
                loading: true,
                onSuccess: result => {
                    observer.next(result as LoginResponse);
                    observer.complete();
                }
            });
        });
    }
}
