import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageUrlService } from '../../page/services/page-url.service';
import { OrganizationDetail, OrganizationEditRequest, OrganizationRow } from '../models/organizations.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    edit(
        baseUrl: string,
        id: string,
        request: OrganizationEditRequest,
        successToast: string
    ): Observable<OrganizationRow> {
        return this.httpService.put<OrganizationRow>(this.url(baseUrl, id), request, { successToast });
    }

    loadOrganization(baseUrl: string, id: string): Observable<OrganizationDetail> {
        return this.httpService.get<OrganizationDetail>(this.url(baseUrl, id));
    }

    private url(baseUrl: string, id: string): string {
        return `${this.pageUrlService.resolve(baseUrl)}/${id}`;
    }
}
