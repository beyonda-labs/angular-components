import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { LoadingService } from '../../components/loading/services/loading.service';
import { ModalService } from '../../components/modal/services/modal.service';
import { ToastService } from '../../components/toast/services/toast.service';
import { HttpService } from './http.service';

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

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('HTTP methods', () => {
        it('should delegate GET to HttpClient', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items').subscribe(result => {
                expect(result).toEqual({ id: 1 });
            });

            expect(httpClient.get).toHaveBeenCalledWith('/api/items', {});
        });

        it('should delegate POST to HttpClient with body', () => {
            const body = { name: 'test' };
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', body).subscribe();

            expect(httpClient.post).toHaveBeenCalledWith('/api/items', body, {});
        });

        it('should delegate PUT to HttpClient with body', () => {
            const body = { name: 'updated' };
            httpClient.put.mockReturnValue(of({ id: 1 }));

            service.put('/api/items/1', body).subscribe();

            expect(httpClient.put).toHaveBeenCalledWith('/api/items/1', body, {});
        });

        it('should delegate PATCH to HttpClient with body', () => {
            const body = { name: 'patched' };
            httpClient.patch.mockReturnValue(of({ id: 1 }));

            service.patch('/api/items/1', body).subscribe();

            expect(httpClient.patch).toHaveBeenCalledWith('/api/items/1', body, {});
        });

        it('should delegate DELETE to HttpClient', () => {
            httpClient.delete.mockReturnValue(of(null));

            service.delete('/api/items/1').subscribe();

            expect(httpClient.delete).toHaveBeenCalledWith('/api/items/1', {});
        });
    });

    describe('query params', () => {
        it('should pass query params as HttpParams', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { queryParams: { page: 1, active: true } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.params).toBeInstanceOf(HttpParams);
            expect(callArguments.params.get('page')).toBe('1');
            expect(callArguments.params.get('active')).toBe('true');
        });

        it('should handle array query params', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { queryParams: { ids: ['1', '2', '3'] } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.params.getAll('ids')).toEqual(['1', '2', '3']);
        });
    });

    describe('headers', () => {
        it('should pass custom headers as HttpHeaders', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { headers: { 'X-Custom': 'value' } }).subscribe();

            const callArguments = httpClient.get.mock.calls[0][1];

            expect(callArguments.headers).toBeInstanceOf(HttpHeaders);
            expect(callArguments.headers.get('X-Custom')).toBe('value');
        });
    });

    describe('loading', () => {
        it('should show loading before request and hide after success', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items', { loading: true });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('should hide loading after error', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { loading: true });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('should not show loading when option is not set', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items').subscribe();

            expect(loadingService.show).not.toHaveBeenCalled();
            expect(loadingService.hide).not.toHaveBeenCalled();
        });

        it('should not show loading when option is false', () => {
            httpClient.get.mockReturnValue(of(null));

            service.get('/api/items', { loading: false }).subscribe();

            expect(loadingService.show).not.toHaveBeenCalled();
            expect(loadingService.hide).not.toHaveBeenCalled();
        });
    });

    describe('success toast', () => {
        it('should show success toast with translation key', () => {
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', {}, { successToast: 'items.created' }).subscribe();

            expect(toastService.showSuccess).toHaveBeenCalledWith({ message: 'items.created' });
        });

        it('should not show toast when successToast is not set', () => {
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', {}).subscribe();

            expect(toastService.showSuccess).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should open error modal by default', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith({
                message: 'angular-components.http.error.unknown',
                title: 'angular-components.http.title.default',
                messageParameters: undefined
            });
        });

        it('should use unknown error key when errorCode has no translation', () => {
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({
                status: 400,
                error: { errorCode: 'unrecognized_error' }
            })));

            service.get('/api/items').subscribe();

            expect(modalService.openError).toHaveBeenCalledWith({
                message: 'angular-components.http.error.unknown',
                title: 'angular-components.http.title.default',
                messageParameters: undefined
            });
        });

        it('should call handleError and skip modal when handleError is provided', () => {
            const handleError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

            service.get('/api/items', { handleError }).subscribe();

            expect(handleError).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
            expect(modalService.openError).not.toHaveBeenCalled();
        });

        it('should call onError regardless of modal', () => {
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { onError }).subscribe();

            expect(onError).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
            expect(modalService.openError).toHaveBeenCalled();
        });

        it('should call both handleError and onError when both are provided', () => {
            const handleError = jest.fn();
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

            service.get('/api/items', { handleError, onError }).subscribe();

            expect(handleError).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
            expect(modalService.openError).not.toHaveBeenCalled();
        });

        it('should complete the observable after error (return EMPTY)', () => {
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
        it('should call onSuccess with result', () => {
            const onSuccess = jest.fn();
            httpClient.get.mockReturnValue(of({ id: 1 }));

            service.get('/api/items', { onSuccess }).subscribe();

            expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
        });

        it('should not fail when onSuccess is not set', () => {
            httpClient.get.mockReturnValue(of({ id: 1 }));

            expect(() => service.get('/api/items').subscribe()).not.toThrow();
        });
    });

    describe('combined options', () => {
        it('should handle loading + successToast + onSuccess together', () => {
            const onSuccess = jest.fn();
            httpClient.post.mockReturnValue(of({ id: 1 }));

            service.post('/api/items', { name: 'test' }, {
                loading: true,
                onSuccess,
                successToast: 'items.created'
            });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
            expect(toastService.showSuccess).toHaveBeenCalledWith({ message: 'items.created' });
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });

        it('should handle loading + error + onError together', () => {
            const onError = jest.fn();
            httpClient.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

            service.get('/api/items', { loading: true, onError });

            expect(loadingService.show).toHaveBeenCalledTimes(1);
            expect(modalService.openError).toHaveBeenCalled();
            expect(onError).toHaveBeenCalled();
            expect(loadingService.hide).toHaveBeenCalledTimes(1);
        });
    });
});
