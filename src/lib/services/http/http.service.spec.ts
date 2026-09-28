import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';

import { LoadingService } from '../../components/loading/services/loading.service';
import { ModalService } from '../../components/modal/services/modal.service';
import { ToastService } from '../../components/toast/services/toast.service';
import { HttpService } from './http.service';

function makeRangeError(errorCode: string, min: number | null, max: number | null) {
    return throwError(
        () =>
            new HttpErrorResponse({
                status: 400,
                error: { errorCode, messageParameters: { fieldName: 'field', min, max } }
            })
    );
}

describe('HttpService', () => {
    let service: HttpService;

    const httpClient = {
        delete: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        post: jest.fn(),
        put: jest.fn()
    };

    const loadingService = {
        hide: jest.fn(),
        show: jest.fn()
    };

    const modalService = {
        openError: jest.fn()
    };

    const toastService = {
        showSuccess: jest.fn()
    };

    const translateService = {
        instant: jest.fn((key: string) => key)
    };

    beforeEach(() => {
        jest.resetAllMocks();

        translateService.instant.mockImplementation((key: string) => key);

        httpClient.delete.mockReturnValue(of(null));
        httpClient.get.mockReturnValue(of(null));
        httpClient.patch.mockReturnValue(of(null));
        httpClient.post.mockReturnValue(of(null));
        httpClient.put.mockReturnValue(of(null));

        TestBed.configureTestingModule({
            providers: [
                HttpService,
                { provide: HttpClient, useValue: httpClient },
                { provide: LoadingService, useValue: loadingService },
                { provide: ModalService, useValue: modalService },
                { provide: ToastService, useValue: toastService },
                { provide: TranslateService, useValue: translateService }
            ]
        });

        service = TestBed.inject(HttpService);
    });

    describe('HTTP methods', () => {
        it('sends a GET through HttpClient and emits its result', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items').subscribe(result => {
                expect(result).toEqual({ id: 1 });
            });

            expect(httpClient.get).toHaveBeenCalledWith('/api/items', {});
        });

        it('sends a POST with its body through HttpClient', () => {
            const body = { name: 'test' };
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', body).subscribe();

            expect(httpClient.post).toHaveBeenCalledWith('/api/items', body, {});
        });

        it('sends a PUT with its body through HttpClient', () => {
            const body = { name: 'updated' };
            httpClient.put.mockReturnValue(of({ id: 1 }));

            service.put('/api/items/1', body).subscribe();

            expect(httpClient.put).toHaveBeenCalledWith('/api/items/1', body, {});
        });

        it('sends a PATCH with its body through HttpClient', () => {
            const body = { name: 'patched' };
            httpClient.patch.mockReturnValue(of({ id: 1 }));

            service.patch('/api/items/1', body).subscribe();

            expect(httpClient.patch).toHaveBeenCalledWith('/api/items/1', body, {});
        });

        it('sends a DELETE with its body through HttpClient', () => {
            httpClient.delete.mockReturnValue(of(null));

            service.delete('/api/items/1', null).subscribe();

            expect(httpClient.delete).toHaveBeenCalledWith('/api/items/1', { body: null });
        });
    });

    describe('query params', () => {
        it('passes the query params as HttpParams', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { queryParams: { page: 1, active: true } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.params).toBeInstanceOf(HttpParams);
            expect(callArguments.params.get('page')).toBe('1');
            expect(callArguments.params.get('active')).toBe('true');
        });

        it('repeats a query param once per value of an array', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { queryParams: { ids: ['1', '2', '3'] } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.params.getAll('ids')).toEqual(['1', '2', '3']);
        });
    });

    describe('headers', () => {
        it('passes custom headers as HttpHeaders', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { headers: { 'X-Custom': 'value' } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.headers).toBeInstanceOf(HttpHeaders);
            expect(callArguments.headers.get('X-Custom')).toBe('value');
        });
    });

    describe('loading', () => {
        it('shows the loading during the request and hides it after success', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items', { loading: true });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('hides the loading after an error', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { loading: true });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('does not show the loading when the option is not set', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items').subscribe();

            expect(loadingService.show).not.toHaveBeenCalled();
            expect(loadingService.hide).not.toHaveBeenCalled();
        });

        it('does not show the loading when the option is false', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { loading: false }).subscribe();

            expect(loadingService.show).not.toHaveBeenCalled();
            expect(loadingService.hide).not.toHaveBeenCalled();
        });
    });

    describe('success toast', () => {
        it('shows the success toast with its translation key', () => {
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', {}, { successToast: 'items.created' }).subscribe();

            expect(toastService.showSuccess).toHaveBeenCalledWith({ message: 'items.created' });
        });

        it('does not show a toast when successToast is not set', () => {
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', {}).subscribe();

            expect(toastService.showSuccess).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('opens the error modal by default', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith({
                message: 'angular-components.http.error.unknown',
                title: 'angular-components.http.title.default',
                messageParameters: {}
            });
        });

        it('uses the unknown error key when the errorCode has no translation', () => {
            httpClient.get.mockReturnValue(
                throwError(
                    () =>
                        new HttpErrorResponse({
                            status: 400,
                            error: { errorCode: 'unrecognized_error' }
                        })
                )
            );

            service.get('/api/items').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith({
                message: 'angular-components.http.error.unknown',
                title: 'angular-components.http.title.default',
                messageParameters: {}
            });
        });

        it('calls handleError instead of opening the error modal', () => {
            const handleError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

            service.get('/api/items', { handleError }).subscribe();

            expect(handleError).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
            expect(modalService.openError).not.toHaveBeenCalled();
        });

        it('calls onError and still opens the error modal', () => {
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { onError }).subscribe();

            expect(onError).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
            expect(modalService.openError).toHaveBeenCalled();
        });

        it('calls both handleError and onError without opening the modal', () => {
            const handleError = jest.fn();
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

            service.get('/api/items', { handleError, onError }).subscribe();

            expect(handleError).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
            expect(modalService.openError).not.toHaveBeenCalled();
        });

        it('completes without emitting or erroring after an error', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            const next = jest.fn();
            const error = jest.fn();
            const complete = jest.fn();

            service.get('/api/items').subscribe({ complete, error, next });

            expect(next).not.toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();
            expect(complete).toHaveBeenCalled();
        });
    });

    describe('onSuccess callback', () => {
        it('calls onSuccess with the result', () => {
            const onSuccess = jest.fn();
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items', { onSuccess }).subscribe();

            expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
        });

        it('does not throw when onSuccess is not set', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            expect(() => service.get('/api/items').subscribe()).not.toThrow();
        });
    });

    describe('range/length error code resolution', () => {
        beforeEach(() => {
            translateService.instant.mockImplementation((key: string) => {
                if (key.startsWith('angular-components.http.error.invalid-field')) {
                    return `translated:${key}`;
                }

                return key;
            });
        });

        it('uses invalid-field-range when both min and max are present', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-range', 0, 100));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-range'
                })
            );
        });

        it('uses invalid-field-range-min when max is null', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-range', 5, null));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-range-min'
                })
            );
        });

        it('uses invalid-field-range-max when min is null', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-range', null, 100));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-range-max'
                })
            );
        });

        it('uses invalid-field-length when both min and max are present', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-length', 3, 50));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-length'
                })
            );
        });

        it('uses invalid-field-length-min when max is null', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-length', 3, null));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-length-min'
                })
            );
        });

        it('uses invalid-field-length-max when min is null', () => {
            httpClient.get.mockReturnValue(makeRangeError('invalid-field-length', null, 50));
            service.get('/api').subscribe();
            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'angular-components.http.error.invalid-field-length-max'
                })
            );
        });

        it('takes the title from the base error code when the message falls back to -min', () => {
            translateService.instant.mockImplementation((key: string) => {
                if (key === 'angular-components.http.title.invalid-field-range') {
                    return 'Value out of range';
                }

                if (key.startsWith('angular-components.http.error.invalid-field')) {
                    return `translated:${key}`;
                }

                return key;
            });

            httpClient.get.mockReturnValue(makeRangeError('invalid-field-range', 5, null));
            service.get('/api').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'angular-components.http.title.invalid-field-range'
                })
            );
        });

        it('takes the title from the base error code when the message falls back to -max', () => {
            translateService.instant.mockImplementation((key: string) => {
                if (key === 'angular-components.http.title.invalid-field-length') {
                    return 'Invalid length';
                }

                if (key.startsWith('angular-components.http.error.invalid-field')) {
                    return `translated:${key}`;
                }

                return key;
            });

            httpClient.get.mockReturnValue(makeRangeError('invalid-field-length', null, 20));
            service.get('/api').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'angular-components.http.title.invalid-field-length'
                })
            );
        });
    });

    describe('combined options', () => {
        it('combines the loading, the success toast and onSuccess on a successful request', () => {
            const onSuccess = jest.fn();
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post(
                '/api/items',
                { name: 'test' },
                {
                    loading: true,
                    onSuccess,
                    successToast: 'items.created'
                }
            );

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
            expect(toastService.showSuccess).toHaveBeenCalledWith({ message: 'items.created' });
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('combines the loading, the error modal and onError on a failed request', () => {
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { loading: true, onError });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(modalService.openError).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });
    });

    describe('subscription sharing', () => {
        it('triggers a single underlying HTTP call when the caller also subscribes to the returned observable', () => {
            let executionCount = 0;
            const cold$ = new Observable(subscriber => {
                executionCount++;
                subscriber.next({ id: 1 });
                subscriber.complete();
            });

            httpClient.put.mockReturnValue(cold$);

            service.put('/api/items/1', { name: 'updated' }).subscribe();

            expect(executionCount).toBe(1);
        });
    });
});
