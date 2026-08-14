import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, filter, finalize, map, Observable, shareReplay, tap } from 'rxjs';

import { LoadingService } from '../../components/loading/services/loading.service';
import { ModalService } from '../../components/modal/services/modal.service';
import { ToastService } from '../../components/toast/services/toast.service';
import { CustomErrorResponse, HttpRequestOptions, UploadRequestOptions } from './models/http.model';

const TITLE_PREFIX = 'angular-components.http.title.';
const ERROR_UNKNOWN_KEY = 'angular-components.http.error.unknown';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private readonly httpClient = inject(HttpClient);
    private readonly loadingService = inject(LoadingService);
    private readonly modalService = inject(ModalService);
    private readonly toastService = inject(ToastService);
    private readonly translateService = inject(TranslateService);

    delete<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.delete<T>(url, { ...this.buildHttpOptions(options), body }), options);
    }

    get<T>(url: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.get<T>(url, this.buildHttpOptions(options)), options);
    }

    getBlob(url: string, options?: HttpRequestOptions): Observable<Blob> {
        const { headers, params } = this.buildHttpOptions(options);

        return this.request(this.httpClient.get(url, { headers, params, responseType: 'blob' }), options);
    }

    patch<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.patch<T>(url, body, this.buildHttpOptions(options)), options);
    }

    post<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.post<T>(url, body, this.buildHttpOptions(options)), options);
    }

    put<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.put<T>(url, body, this.buildHttpOptions(options)), options);
    }

    upload<T>(url: string, body: ArrayBuffer | Blob, options?: UploadRequestOptions): Observable<T> {
        const { headers, params } = this.buildHttpOptions(options);
        const events$ = this.httpClient.put<T>(url, body, {
            headers,
            observe: 'events',
            params,
            reportProgress: true
        });

        return this.request(
            events$.pipe(
                tap(event => {
                    if (event.type === HttpEventType.UploadProgress) {
                        options?.onProgress?.(event.total ? event.loaded / event.total : 0);
                    }
                }),
                filter((event): event is HttpResponse<T> => event.type === HttpEventType.Response),
                map(event => event.body as T)
            ),
            options
        );
    }

    private buildHttpOptions(options?: HttpRequestOptions): { headers?: HttpHeaders; params?: HttpParams } {
        const result: { headers?: HttpHeaders; params?: HttpParams } = {};

        if (options?.headers) {
            result.headers = new HttpHeaders(options.headers);
        }

        if (options?.queryParams) {
            let parameters = new HttpParams();

            for (const [key, value] of Object.entries(options.queryParams)) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        parameters = parameters.append(key, item);
                    }
                } else {
                    parameters = parameters.set(key, String(value));
                }
            }

            result.params = parameters;
        }

        return result;
    }

    private resolveErrorMessage(error: HttpErrorResponse): {
        message: string;
        title: string;
        messageParameters?: Record<string, unknown>;
    } {
        const body = error.error as CustomErrorResponse | null,
            messageParameters = this.resolveErrorParameters(body?.messageParameters);

        if (body?.message) {
            return {
                message: `angular-components.http.error.${body.message}`,
                title: this.resolveErrorTitle(body.message),
                messageParameters
            };
        }

        const errorCode = body?.errorCode ?? 'unknown';
        const resolvedCode = this.resolveRangeCode(errorCode, body?.messageParameters);
        const key = `angular-components.http.error.${resolvedCode}`;
        const translation = this.translateService.instant(key);

        return {
            message: translation !== key ? key : ERROR_UNKNOWN_KEY,
            title: this.resolveErrorTitle(resolvedCode),
            messageParameters
        };
    }

    private resolveRangeCode(errorCode: string, parameters?: Record<string, unknown>): string {
        if (errorCode !== 'invalid-field-range' && errorCode !== 'invalid-field-length') {
            return errorCode;
        }

        if (parameters?.['min'] === null) {
            return `${errorCode}-max`;
        }

        if (parameters?.['max'] === null) {
            return `${errorCode}-min`;
        }

        return errorCode;
    }

    private resolveErrorTitle(errorKey: string): string {
        const baseKey = errorKey.replace(/-(min|max)$/u, '');
        const titleKey = `${TITLE_PREFIX}${baseKey}`;
        const translated = this.translateService.instant(titleKey);

        return translated !== titleKey ? titleKey : `${TITLE_PREFIX}default`;
    }

    private resolveErrorParameters(parameters: Record<string, unknown> = {}): Record<string, unknown> {
        const fieldPrefix = 'angular-components.http.field.';

        return Object.fromEntries(
            Object.entries(parameters).map(([key, value]) => {
                if (typeof value !== 'string') {
                    return [key, String(value)];
                }

                const translationKey = `${fieldPrefix}${value}`,
                    translated = this.translateService.instant(translationKey);

                return [key, translated !== translationKey ? translated : value];
            })
        );
    }

    private request<T>(source$: Observable<T>, options?: HttpRequestOptions): Observable<T> {
        if (options?.loading) {
            this.loadingService.show();
        }

        // `subscribe()` below drives the loading/toast/error side effects immediately, independent of
        // whether (or how many times) the caller subscribes to the returned observable. `shareReplay(1)`
        // makes that subscription and the caller's share the same underlying HTTP call — without it,
        // HttpClient's cold observable would fire the request a second time when the caller subscribes.
        const request = source$.pipe(
            tap(result => {
                options?.onSuccess?.(result);

                if (options?.successToast) {
                    this.toastService.showSuccess({ message: options.successToast });
                }
            }),
            catchError((error: HttpErrorResponse) => {
                if (options?.handleError) {
                    options.handleError(error);
                } else {
                    const { message, title, messageParameters } = this.resolveErrorMessage(error);
                    this.modalService.openError({ message, title, messageParameters });
                }

                options?.onError?.(error);

                return EMPTY;
            }),
            finalize(() => {
                if (options?.loading) {
                    this.loadingService.hide();
                }
            }),
            shareReplay(1)
        );

        request.subscribe();

        return request;
    }
}
