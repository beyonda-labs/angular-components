import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageBackendResponse } from '../models/page.model';
import { PageItemType, PageRestoredRename, PageTrashItem } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import {
    PAGE_ORGANIZATIONS_PATH,
    PageOrganization,
    PageOrganizationsResponse
} from '../models/page-organization.model';
import { PAGE_OWNER_FIELD, PAGE_OWNERS_PATH, PageOwner, PageOwnersResponse } from '../models/page-owner.model';
import { PAGE_SHARED_PATH, PageShareEntry, PageShares, PageShareTargets } from '../models/page-sharing.model';
import {
    PAGE_TRANSFER_CATEGORY_IDS_PARAMETER,
    PAGE_TRANSFER_IDS_PARAMETER,
    PAGE_TRANSFER_PATH,
    PAGE_TRANSFER_TARGETS_PATH,
    PageTransferResponse,
    PageTransferTargets
} from '../models/page-transfer.model';
import { PAGE_USAGES_IDS_SEPARATOR, PageUsages, PageUsagesResponse } from '../models/page-usages.model';
import { PageUrlService } from './page-url.service';

type QueryParameters = Record<string, string | number>;

@Injectable({
    providedIn: 'root'
})
export class PageHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    changeStatus(
        relativeUrl: string,
        id: string | number,
        value: Record<string, string>,
        successToast: string
    ): Observable<unknown> {
        return this.httpService.post(this.url(relativeUrl, `/${id}/status`), value, { successToast });
    }

    create(relativeUrl: string, value: unknown, successToast: string): Observable<unknown> {
        return this.httpService.post(this.url(relativeUrl), value, { successToast });
    }

    createCategory(relativeUrl: string, value: unknown, successToast: string): Observable<unknown> {
        return this.httpService.post(this.url(relativeUrl, '/categories'), value, { successToast });
    }

    deleteCategories(relativeUrl: string, ids: (string | number)[], successToast: string): Observable<void> {
        return this.httpService.delete<void>(this.url(relativeUrl, '/categories'), { ids }, { successToast });
    }

    deleteItems(relativeUrl: string, ids: (string | number)[], successToast: string): Observable<void> {
        return this.httpService.delete<void>(this.url(relativeUrl), { ids }, { successToast });
    }

    deleteTrashItems(relativeUrl: string, items: PageTrashItem[], successToast: string): Observable<void> {
        return this.httpService.delete<void>(this.url(relativeUrl, '/trash'), { items }, { successToast });
    }

    duplicate(
        relativeUrl: string,
        id: string | number,
        value: Record<string, string>,
        successToast: string
    ): Observable<unknown> {
        return this.httpService.post(this.url(relativeUrl, `/${id}/duplicate`), value, { successToast });
    }

    edit(relativeUrl: string, id: string | number, value: unknown, successToast: string): Observable<unknown> {
        return this.httpService.put(this.url(relativeUrl, `/${id}`), value, { successToast });
    }

    editCategory(relativeUrl: string, id: string | number, value: unknown, successToast: string): Observable<unknown> {
        return this.httpService.put(this.url(relativeUrl, `/categories/${id}`), value, { successToast });
    }

    emptyTrash(relativeUrl: string, successToast: string): Observable<void> {
        return this.httpService.delete<void>(this.url(relativeUrl, '/trash/all'), undefined, { successToast });
    }

    findCategoryUsages(relativeUrl: string, ids: (string | number)[]): Observable<PageUsages[]> {
        return this.requestUsages(this.url(relativeUrl, '/categories/usages'), ids);
    }

    findOrganizations(relativeUrl: string): Observable<PageOrganization[]> {
        return this.httpService
            .get<PageOrganizationsResponse>(this.url(relativeUrl, PAGE_ORGANIZATIONS_PATH), {
                handleError: ignoreError
            })
            .pipe(map(({ organizations }) => organizations));
    }

    findOwners(relativeUrl: string): Observable<PageOwner[]> {
        return this.httpService
            .get<PageOwnersResponse>(this.url(relativeUrl, PAGE_OWNERS_PATH), { handleError: ignoreError })
            .pipe(map(({ owners }) => owners));
    }

    findShares(relativeUrl: string, folderId: string | number): Observable<PageShares> {
        return this.httpService.get<PageShares>(this.url(relativeUrl, `/categories/${folderId}/shares`));
    }

    findUsages(relativeUrl: string, ids: (string | number)[]): Observable<PageUsages[]> {
        return this.requestUsages(this.url(relativeUrl, '/usages'), ids);
    }

    load(relativeUrl: string, queryParameters: QueryParameters): Observable<PageBackendResponse> {
        return this.httpService.get<PageBackendResponse>(this.url(relativeUrl), { queryParams: queryParameters });
    }

    loadCategoryPath(relativeUrl: string, categoryId: string | number): Observable<PageItem[]> {
        return this.httpService.get<PageItem[]>(this.url(relativeUrl, `/categories/${categoryId}/path`));
    }

    loadCategoryPathQuietly(relativeUrl: string, categoryId: string | number): Observable<PageItem[]> {
        return this.httpService.get<PageItem[]>(
            this.url(relativeUrl, `/categories/${encodeURIComponent(categoryId)}/path`),
            {
                handleError: ignoreError
            }
        );
    }

    loadCategoryTree(relativeUrl: string, ownerId?: string): Observable<PageItem[]> {
        return this.httpService.get<PageItem[]>(
            this.url(relativeUrl, '/categories/tree'),
            ownerId === undefined ? undefined : { queryParams: { [PAGE_OWNER_FIELD]: ownerId } }
        );
    }

    loadShared(relativeUrl: string, queryParameters: QueryParameters): Observable<PageBackendResponse> {
        return this.httpService.get<PageBackendResponse>(this.url(relativeUrl, PAGE_SHARED_PATH), {
            queryParams: queryParameters
        });
    }

    loadTrash(relativeUrl: string, queryParameters: QueryParameters): Observable<PageBackendResponse> {
        return this.httpService.get<PageBackendResponse>(this.url(relativeUrl, '/trash'), {
            queryParams: queryParameters
        });
    }

    moveItems(
        relativeUrl: string,
        items: PageTrashItem[],
        targetId: string | number | null,
        successToast: string
    ): Observable<void> {
        return this.httpService.put<void>(this.url(relativeUrl, '/move'), { items, targetId }, { successToast });
    }

    restoreTrashItems(
        relativeUrl: string,
        items: PageTrashItem[],
        successToast: string
    ): Observable<PageRestoredRename[]> {
        return this.httpService
            .put<{
                renamed?: PageRestoredRename[];
            } | null>(this.url(relativeUrl, '/trash'), { items }, { successToast })
            .pipe(map(response => response?.renamed ?? []));
    }

    saveShares(
        relativeUrl: string,
        folderId: string | number,
        shares: PageShareEntry[],
        successToast: string
    ): Observable<PageShares> {
        return this.httpService.put<PageShares>(
            this.url(relativeUrl, `/categories/${folderId}/shares`),
            { shares },
            { successToast }
        );
    }

    searchShareTargets(
        relativeUrl: string,
        folderId: string | number,
        search: string,
        limit: number
    ): Observable<PageShareTargets> {
        return this.httpService.get<PageShareTargets>(this.url(relativeUrl, `/categories/${folderId}/share-targets`), {
            queryParams: { search, limit }
        });
    }

    searchTransferTargets(
        relativeUrl: string,
        items: PageTrashItem[],
        search: string,
        limit: number
    ): Observable<PageTransferTargets> {
        return this.httpService.get<PageTransferTargets>(this.url(relativeUrl, PAGE_TRANSFER_TARGETS_PATH), {
            queryParams: { ...toTransferSelection(items), search, limit }
        });
    }

    transfer(relativeUrl: string, items: PageTrashItem[], targetUserId: string): Observable<PageTransferResponse> {
        return this.httpService.post<PageTransferResponse>(this.url(relativeUrl, PAGE_TRANSFER_PATH), {
            items,
            targetUserId
        });
    }

    private requestUsages(url: string, ids: (string | number)[]): Observable<PageUsages[]> {
        return this.httpService
            .get<PageUsagesResponse>(url, { queryParams: { ids: ids.join(PAGE_USAGES_IDS_SEPARATOR) } })
            .pipe(map(({ usages }) => usages));
    }

    private url(relativeUrl: string, suffix = ''): string {
        return `${this.pageUrlService.resolve(relativeUrl)}${suffix}`;
    }
}

function ignoreError(): void {}

function joinIds(items: PageTrashItem[], type: PageItemType): string {
    return items
        .filter(item => item.type === type)
        .map(({ id }) => id)
        .join(PAGE_USAGES_IDS_SEPARATOR);
}

function toTransferSelection(items: PageTrashItem[]): QueryParameters {
    const ids = joinIds(items, PageItemType.Item);
    const categoryIds = joinIds(items, PageItemType.Category);

    return {
        ...(ids ? { [PAGE_TRANSFER_IDS_PARAMETER]: ids } : {}),
        ...(categoryIds ? { [PAGE_TRANSFER_CATEGORY_IDS_PARAMETER]: categoryIds } : {})
    };
}
