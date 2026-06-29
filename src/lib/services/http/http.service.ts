import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, finalize, Observable, tap } from 'rxjs';

import { LoadingService } from '../../components/loading/services/loading.service';
import { ModalService } from '../../components/modal/services/modal.service';
import { ToastService } from '../../components/toast/services/toast.service';
import { CustomErrorResponse, HttpRequestOptions } from './models/http.model';

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

    delete<T>(url: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.delete<T>(url, this.buildHttpOptions(options)), options);
    }

    get<T>(url: string, options?: HttpRequestOptions): Observable<T> {
        return this.request(this.httpClient.get<T>(url, this.buildHttpOptions(options)), options);
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
        const key = `angular-components.http.error.${errorCode}`;
        const translation = this.translateService.instant(key);

        return {
            message: translation !== key ? key : ERROR_UNKNOWN_KEY,
            title: this.resolveErrorTitle(errorCode)
        };
    }

    private resolveErrorTitle(errorKey: string): string {
        const titleKey = `${TITLE_PREFIX}${errorKey}`;
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
            })
        );

        request.subscribe();

        return request;
    }
}
