import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import { ORGANIZATION_SUMMARY_PATH, OrganizationSummary } from '../models/organization-summary.model';

@Injectable({
    providedIn: 'root'
})
export class OrganizationSummaryHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    load(organizationsUrl: string): Observable<OrganizationSummary> {
        return this.httpService.get<OrganizationSummary>(
            `${this.pageUrlService.resolve(organizationsUrl)}${ORGANIZATION_SUMMARY_PATH}`
        );
    }
}
