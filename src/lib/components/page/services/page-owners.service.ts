import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { SearchFilter } from '../../search/models/search-filter.model';
import { hasOwnerFilter, readOwnerFilterUrl } from '../functions/page-owner-filter';
import { PageConfig } from '../models/page.model';
import { PageOwner, PageOwnersAnswer } from '../models/page-owner.model';
import { PageHttpService } from './page-http.service';

@Injectable()
export class PageOwnersService {
    private readonly pageHttpService = inject(PageHttpService);

    private readonly _answer = signal<PageOwnersAnswer | null>(null);
    private request?: Subscription;
    private requestedUrl: string | null = null;

    load(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): void {
        const baseUrl = readOwnerFilterUrl(config);

        if (!baseUrl || baseUrl === this.requestedUrl) {
            return;
        }

        this.requestedUrl = baseUrl;
        this.request?.unsubscribe();
        this.request = this.pageHttpService
            .findOwners(baseUrl)
            .subscribe(owners => this._answer.set({ baseUrl, owners }));
    }

    loadWhenFiltered(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>, filters: SearchFilter[]): void {
        if (hasOwnerFilter(filters)) {
            this.load(config);
        }
    }

    ownersOf(config: Pick<PageConfig, 'baseUrl' | 'tableConfig'>): PageOwner[] {
        const answer = this._answer();

        return answer && answer.baseUrl === readOwnerFilterUrl(config) ? answer.owners : [];
    }
}
