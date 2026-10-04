import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageBackendResponse } from '../models/page.model';
import { PageTrashItem } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
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

    load(relativeUrl: string, queryParameters: QueryParameters): Observable<PageBackendResponse> {
        return this.httpService.get<PageBackendResponse>(this.url(relativeUrl), { queryParams: queryParameters });
    }

    loadCategoryPath(relativeUrl: string, categoryId: string | number): Observable<PageItem[]> {
        return this.httpService.get<PageItem[]>(this.url(relativeUrl, `/categories/${categoryId}/path`));
    }

    loadCategoryTree(relativeUrl: string): Observable<PageItem[]> {
        return this.httpService.get<PageItem[]>(this.url(relativeUrl, '/categories/tree'));
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

    restoreTrashItems(relativeUrl: string, items: PageTrashItem[], successToast: string): Observable<void> {
        return this.httpService.put<void>(this.url(relativeUrl, '/trash'), { items }, { successToast });
    }

    private url(relativeUrl: string, suffix = ''): string {
        return `${this.pageUrlService.resolve(relativeUrl)}${suffix}`;
    }
}
