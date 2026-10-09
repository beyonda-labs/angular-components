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

const ignoreError = (): void => undefined;

@Injectable({ providedIn: 'root' })
export class LoginHttpService {
    private readonly envConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    private readonly baseUrl = this.envConfig.accessControlUrl;

    acceptInvitation(request: AcceptInvitationRequest): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/invitation`, request, {
            loading: true,
            withCredentials: true
        });
    }

    forgotPassword(email: string): Observable<void> {
        return this.httpService.post<void>(`${this.baseUrl}/password/forgot`, { email }, { loading: true });
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
            loading: true,
            withCredentials: true
        });
    }

    register(values: Record<string, unknown>): Observable<RegisterResponse> {
        return this.httpService.post<RegisterResponse>(`${this.baseUrl}/register`, values, {
            loading: true,
            withCredentials: true
        });
    }

    resendVerification(email: string): Observable<void> {
        return this.httpService.post<void>(`${this.baseUrl}/verification/resend`, { email }, { loading: true });
    }

    resetPassword(request: ResetPasswordRequest): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(`${this.baseUrl}/password/reset`, request, {
            loading: true,
            withCredentials: true
        });
    }

    verifyEmail(token: string): Observable<LoginResponse> {
        return this.httpService.post<LoginResponse>(
            `${this.baseUrl}/verification`,
            { token },
            { withCredentials: true }
        );
    }
}
