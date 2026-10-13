import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageOrganization, PageOrganizationsResponse } from '../../page/models/page-organization.model';
import { PageUrlService } from '../../page/services/page-url.service';
import { USERS_ORGANIZATIONS_PATH } from '../models/user-organizations.model';

@Injectable({
    providedIn: 'root'
})
export class UserOrganizationsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    loadOrganizations(baseUrl: string): Observable<PageOrganization[]> {
        return this.httpService
            .get<PageOrganizationsResponse>(`${this.pageUrlService.resolve(baseUrl)}${USERS_ORGANIZATIONS_PATH}`, {
                handleError: ignoreError
            })
            .pipe(map(({ organizations }) => organizations));
    }
}

function ignoreError(): void {}
