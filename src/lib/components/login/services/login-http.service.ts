import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import {
    AcceptInvitationRequest,
    Invitation,
    LoginCredentials,
    LoginProviderConfig,
    LoginResponse,
    RegisterField,
    RegisterResponse,
    ResetPasswordRequest
} from '../models/login.model';

@Injectable({ providedIn: 'root' })
export class LoginHttpService {
    private readonly envConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    private readonly baseUrl = this.envConfig.accessControlUrl;

    acceptInvitation(request: AcceptInvitationRequest): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/invitation`, request, {
            isLoading: true,
            hasCredentials: true
        });
    }

    forgotPassword(email: string): Observable<void> {
        return this.httpService.post<void>(`${this.baseUrl}/password/forgot`, { email }, { isLoading: true });
    }

    getInvitation(token: string): Observable<Invitation> {
        return this.httpService.get<Invitation>(`${this.baseUrl}/invitation`, { queryParams: { token } });
    }

    getProviders(): Observable<LoginProviderConfig[]> {
        return this.httpService
            .get<LoginProviderConfig[]>(`${this.baseUrl}/providers`, { handleError: ignoreError })
            .pipe(catchError(() => of([])));
    }

    getRegisterFields(): Observable<RegisterField[]> {
        return this.httpService
            .get<RegisterField[]>(`${this.baseUrl}/register/fields`, { handleError: ignoreError })
            .pipe(catchError(() => of([])));
    }

    login(credentials: LoginCredentials): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/login`, credentials, {
            isLoading: true,
            hasCredentials: true
        });
    }

    register(values: Record<string, unknown>): Observable<RegisterResponse> {
        return this.httpService.post<RegisterResponse>(`${this.baseUrl}/register`, values, {
            isLoading: true,
            hasCredentials: true
        });
    }

    resendVerification(email: string): Observable<void> {
        return this.httpService.post<void>(`${this.baseUrl}/verification/resend`, { email }, { isLoading: true });
    }

    resetPassword(request: ResetPasswordRequest): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/password/reset`, request, {
            isLoading: true,
            hasCredentials: true
        });
    }

    verifyEmail(token: string): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(
            `${this.baseUrl}/verification`,
            { token },
            { hasCredentials: true }
        );
    }
}

function ignoreError(): void {}
