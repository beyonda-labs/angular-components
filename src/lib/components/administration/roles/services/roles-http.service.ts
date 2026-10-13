import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import { RolePermissionEntry } from '../../models/role-permissions.model';
import { RolePermissionsResponse, RoleRequest, RoleRow, ROLES_PERMISSIONS_PATH } from '../models/roles.model';

@Injectable({
    providedIn: 'root'
})
export class RolesHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    create(baseUrl: string, request: RoleRequest, successToast: string): Observable<RoleRow> {
        return this.httpService.post<RoleRow>(this.pageUrlService.resolve(baseUrl), request, { successToast });
    }

    loadPermissions(baseUrl: string): Observable<RolePermissionEntry[]> {
        return this.httpService
            .get<RolePermissionsResponse>(`${this.pageUrlService.resolve(baseUrl)}${ROLES_PERMISSIONS_PATH}`, {
                handleError: ignoreError
            })
            .pipe(map(({ permissions }) => permissions));
    }
}

function ignoreError(): void {}
