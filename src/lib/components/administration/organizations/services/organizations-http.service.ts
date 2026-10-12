import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import {
    OrganizationContent,
    OrganizationContentResponse,
    OrganizationDetail,
    OrganizationEditRequest,
    OrganizationRow,
    ORGANIZATIONS_CONTENT_PATH
} from '../models/organizations.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    deleteOrganization(baseUrl: string, id: string, name: string, successToast: string): Observable<void> {
        return this.httpService.delete<void>(this.url(baseUrl, id), { name }, { successToast });
    }

    edit(
        baseUrl: string,
        id: string,
        request: OrganizationEditRequest,
        successToast: string
    ): Observable<OrganizationRow> {
        return this.httpService.put<OrganizationRow>(this.url(baseUrl, id), request, { successToast });
    }

    loadContent(baseUrl: string, id: string): Observable<OrganizationContent> {
        return this.httpService
            .get<OrganizationContentResponse>(this.url(baseUrl, id, ORGANIZATIONS_CONTENT_PATH))
            .pipe(map(({ counts = {} }) => ({ counts })));
    }

    loadOrganization(baseUrl: string, id: string): Observable<OrganizationDetail> {
        return this.httpService.get<OrganizationDetail>(this.url(baseUrl, id));
    }

    private url(baseUrl: string, id: string, suffix = ''): string {
        return `${this.pageUrlService.resolve(baseUrl)}/${id}${suffix}`;
    }
}
