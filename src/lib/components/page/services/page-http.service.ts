import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageBackendResponse } from '../models/page.model';
import { PageUrlService } from './page-url.service';

@Injectable({
    providedIn: 'root'
})
export class PageHttpService {
    private readonly httpService = inject(HttpService);
    private readonly pageUrlService = inject(PageUrlService);

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
}
