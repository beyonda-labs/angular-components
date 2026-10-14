import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../../services/http/http.service';
import { PageSearch } from '../../../page/models/page-search.model';
import { PageSearchService } from '../../../page/services/page-search.service';
import { PageUrlService } from '../../../page/services/page-url.service';
import { SearchFieldOptionsResult } from '../../../search/models/search.model';
import { AUDIT_EXPORT_PATH, AUDIT_USER_OPTIONS_PATH, AuditEventRow } from '../models/audit.model';

@Injectable({
    providedIn: 'root'
})
export class AuditHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageSearchService = inject(PageSearchService);
    private readonly pageUrlService = inject(PageUrlService);

    exportEvents(baseUrl: string, search: PageSearch): Observable<Blob> {
        return this.httpService.getBlob(this.url(baseUrl, AUDIT_EXPORT_PATH), {
            isLoading: true,
            queryParams: this.pageSearchService.buildQueryParameters(search, true)
        });
    }

    loadEvent(baseUrl: string, id: string): Observable<AuditEventRow> {
        return this.httpService.get<AuditEventRow>(this.url(baseUrl, `/${encodeURIComponent(id)}`));
    }

    searchUsers(baseUrl: string, text: string, limit: number): Observable<SearchFieldOptionsResult> {
        return this.httpService
            .get<Partial<SearchFieldOptionsResult>>(this.url(baseUrl, AUDIT_USER_OPTIONS_PATH), {
                queryParams: { limit, search: text }
            })
            .pipe(map(({ hasMore = false, options = [] }) => ({ hasMore, options })));
    }

    private url(baseUrl: string, suffix: string): string {
        return `${this.pageUrlService.resolve(baseUrl)}${suffix}`;
    }
}
