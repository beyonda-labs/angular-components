import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import { RolePermissionEntry, RolePermissionsResponse, ROLES_PERMISSIONS_PATH } from '../models/roles.model';

const ignoreError = (): void => undefined;

@Injectable({
    providedIn: 'root'
})
export class RolesHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    loadPermissions(baseUrl: string): Observable<RolePermissionEntry[]> {
        return this.httpService
            .get<RolePermissionsResponse>(`${this.pageUrlService.resolve(baseUrl)}${ROLES_PERMISSIONS_PATH}`, {
                handleError: ignoreError
            })
            .pipe(map(({ permissions }) => permissions));
    }
}
