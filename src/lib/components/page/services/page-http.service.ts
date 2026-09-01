import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageBackendResponse } from '../models/page.model';
import { PageTrashItem } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageUrlService } from './page-url.service';

@Injectable({
    providedIn: 'root'
})
export class PageHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

    create(relativeUrl: string, value: unknown, successToast: string): Observable<unknown> {
        return new Observable(observer => {
            this.httpService.post(this.pageUrlService.resolve(relativeUrl), value, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result);
                    observer.complete();
                },
                successToast
            });
        });
    }

    createCategory(relativeUrl: string, value: unknown, successToast: string): Observable<unknown> {
        return new Observable(observer => {
            this.httpService.post(`${this.pageUrlService.resolve(relativeUrl)}/categories`, value, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result);
                    observer.complete();
                },
                successToast
            });
        });
    }

    deleteItems(relativeUrl: string, ids: (string | number)[], successToast: string): Observable<void> {
        return new Observable(observer => {
            this.httpService.delete<void>(
                this.pageUrlService.resolve(relativeUrl),
                { ids },
                {
                    onError: error => observer.error(error),
                    onSuccess: () => {
                        observer.next();
                        observer.complete();
                    },
                    successToast
                }
            );
        });
    }

    edit(relativeUrl: string, id: string | number, value: unknown, successToast: string): Observable<unknown> {
        return new Observable(observer => {
            this.httpService.put(`${this.pageUrlService.resolve(relativeUrl)}/${id}`, value, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result);
                    observer.complete();
                },
                successToast
            });
        });
    }

    editCategory(relativeUrl: string, id: string | number, value: unknown, successToast: string): Observable<unknown> {
        return new Observable(observer => {
            this.httpService.put(`${this.pageUrlService.resolve(relativeUrl)}/categories/${id}`, value, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result);
                    observer.complete();
                },
                successToast
            });
        });
    }

    deleteCategories(relativeUrl: string, ids: (string | number)[], successToast: string): Observable<void> {
        return new Observable(observer => {
            this.httpService.delete<void>(
                `${this.pageUrlService.resolve(relativeUrl)}/categories`,
                { ids },
                {
                    onError: error => observer.error(error),
                    onSuccess: () => {
                        observer.next();
                        observer.complete();
                    },
                    successToast
                }
            );
        });
    }

    deleteTrashItems(relativeUrl: string, items: PageTrashItem[], successToast: string): Observable<void> {
        return new Observable(observer => {
            this.httpService.delete<void>(
                `${this.pageUrlService.resolve(relativeUrl)}/trash`,
                { items },
                {
                    onError: error => observer.error(error),
                    onSuccess: () => {
                        observer.next();
                        observer.complete();
                    },
                    successToast
                }
            );
        });
    }

    load(relativeUrl: string, queryParameters: Record<string, string | number>): Observable<PageBackendResponse> {
        return new Observable(observer => {
            this.httpService.get<PageBackendResponse>(this.pageUrlService.resolve(relativeUrl), {
                queryParams: queryParameters,
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result as PageBackendResponse);
                    observer.complete();
                }
            });
        });
    }

    loadCategoryPath(relativeUrl: string, categoryId: string | number): Observable<PageItem[]> {
        return new Observable(observer => {
            this.httpService.get<PageItem[]>(`${this.pageUrlService.resolve(relativeUrl)}/categories/${categoryId}/path`, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result as PageItem[]);
                    observer.complete();
                }
            });
        });
    }

    loadCategoryTree(relativeUrl: string): Observable<PageItem[]> {
        return new Observable(observer => {
            this.httpService.get<PageItem[]>(`${this.pageUrlService.resolve(relativeUrl)}/categories/tree`, {
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result as PageItem[]);
                    observer.complete();
                }
            });
        });
    }

    loadTrash(relativeUrl: string, queryParameters: Record<string, string | number>): Observable<PageBackendResponse> {
        return new Observable(observer => {
            this.httpService.get<PageBackendResponse>(`${this.pageUrlService.resolve(relativeUrl)}/trash`, {
                queryParams: queryParameters,
                onError: error => observer.error(error),
                onSuccess: result => {
                    observer.next(result as PageBackendResponse);
                    observer.complete();
                }
            });
        });
    }

    moveItems(
        relativeUrl: string,
        items: PageTrashItem[],
        targetId: string | number | null,
        successToast: string
    ): Observable<void> {
        return new Observable(observer => {
            this.httpService.put<void>(
                `${this.pageUrlService.resolve(relativeUrl)}/move`,
                { items, targetId },
                {
                    onError: error => observer.error(error),
                    onSuccess: () => {
                        observer.next();
                        observer.complete();
                    },
                    successToast
                }
            );
        });
    }

    restoreTrashItems(relativeUrl: string, items: PageTrashItem[], successToast: string): Observable<void> {
        return new Observable(observer => {
            this.httpService.put<void>(
                `${this.pageUrlService.resolve(relativeUrl)}/trash`,
                { items },
                {
                    onError: error => observer.error(error),
                    onSuccess: () => {
                        observer.next();
                        observer.complete();
                    },
                    successToast
                }
            );
        });
    }
}
