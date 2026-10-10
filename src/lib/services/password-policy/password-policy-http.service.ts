import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, Observable } from 'rxjs';

import { ENVIRONMENT_CONFIG } from '../environment/models/environment.model';
import { HttpService } from '../http/http.service';
import { PasswordPolicyParameters } from './models/password-policy.model';

const POLICY_PATH = '/password-policy';

const ignoreError = (): void => undefined;

@Injectable({
    providedIn: 'root'
})
export class PasswordPolicyHttpService {
    private readonly environmentConfig = inject(ENVIRONMENT_CONFIG);
    private readonly httpService = inject(HttpService);

    load(): Observable<PasswordPolicyParameters> {
        return this.httpService
            .get<PasswordPolicyParameters>(`${this.environmentConfig.accessControlUrl}${POLICY_PATH}`, {
                handleError: ignoreError
            })
            .pipe(catchError(() => EMPTY));
    }
}
