import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageOrganization, PageOrganizationsResponse } from '../../page/models/page-organization.model';
import { PageUrlService } from '../../page/services/page-url.service';
import { UserRolesResponse, USERS_ORGANIZATIONS_PATH, USERS_ROLES_PATH } from '../models/users.model';

const ignoreError = (): void => undefined;

@Injectable({
    providedIn: 'root'
})
export class UsersHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    loadOrganizations(baseUrl: string): Observable<PageOrganization[]> {
        return this.httpService
            .get<PageOrganizationsResponse>(`${this.pageUrlService.resolve(baseUrl)}${USERS_ORGANIZATIONS_PATH}`, {
                handleError: ignoreError
            })
            .pipe(map(({ organizations }) => organizations));
    }

    loadRoles(baseUrl: string): Observable<string[]> {
        return this.httpService
            .get<UserRolesResponse>(`${this.pageUrlService.resolve(baseUrl)}${USERS_ROLES_PATH}`)
            .pipe(map(({ roles }) => roles));
    }

    resendInvitation(baseUrl: string, id: string, successToast: string): Observable<void> {
        return this.httpService.post<void>(`${this.pageUrlService.resolve(baseUrl)}/${id}/invitation`, null, {
            successToast
        });
    }
}
