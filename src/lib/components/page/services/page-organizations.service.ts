import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { SearchFilter } from '../../search/models/search-filter.model';
import { hasOrganizationColumn, hiddenOrganizationColumn, withoutColumn } from '../functions/page-organization-column';
import { hasOrganizationFilter, readOrganizationsUrl } from '../functions/page-organization-filter';
import { PageConfig } from '../models/page.model';
import { PageOrganization, PageOrganizationsAnswer } from '../models/page-organization.model';
import { PageHttpService } from './page-http.service';

@Injectable()
export class PageOrganizationsService {
    private readonly pageHttpService = inject(PageHttpService);

    private readonly _answer = signal<PageOrganizationsAnswer | null>(null);
    private request?: Subscription;
    private requestedUrl: string | null = null;

    load(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): void {
        const baseUrl = readOrganizationsUrl(config);

        if (!baseUrl || baseUrl === this.requestedUrl) {
            return;
        }

        this.requestedUrl = baseUrl;
        this.request?.unsubscribe();
        this.request = this.pageHttpService
            .findOrganizations(baseUrl)
            .subscribe(organizations => this._answer.set({ baseUrl, organizations }));
    }

    loadForPage(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>, filters: SearchFilter[]): void {
        if (hasOrganizationColumn(config.tableConfig?.columns ?? []) || hasOrganizationFilter(filters)) {
            this.load(config);
        }
    }

    organizationsOf(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): PageOrganization[] {
        const answer = this._answer();

        return answer && answer.baseUrl === readOrganizationsUrl(config) ? answer.organizations : [];
    }

    withoutHidden<T>(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>, entries: T[]): T[] {
        return withoutColumn(
            entries,
            hiddenOrganizationColumn(config.tableConfig?.columns ?? [], this.organizationsOf(config))
        );
    }
}
