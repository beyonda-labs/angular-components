import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import { UserRoles, UserRolesResponse, USERS_ROLES_PATH } from '../models/users.model';

@Injectable({
    providedIn: 'root'
})
export class UsersHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    loadRoles(baseUrl: string): Observable<UserRoles> {
        return this.httpService
            .get<UserRolesResponse>(`${this.pageUrlService.resolve(baseUrl)}${USERS_ROLES_PATH}`)
            .pipe(map(({ extraRoles = [], roles }) => ({ extraRoles, roles })));
    }

    resendInvitation(baseUrl: string, id: string, successToast: string): Observable<void> {
        return this.httpService.post<void>(`${this.pageUrlService.resolve(baseUrl)}/${id}/invitation`, null, {
            successToast
        });
    }
}
