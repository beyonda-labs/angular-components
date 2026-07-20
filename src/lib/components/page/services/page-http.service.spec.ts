import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { HttpRequestOptions } from '../../../services/http/models/http.model';
import { PageBackendResponse } from '../models/page.model';
import { PageHttpService } from './page-http.service';
import { PageUrlService } from './page-url.service';

describe('PageHttpService', () => {
    let httpServiceMock: MockProxy<HttpService>;
    let service: PageHttpService;

    beforeEach(() => {
        httpServiceMock = mock<HttpService>();

        TestBed.configureTestingModule({
            providers: [
                PageHttpService,
                PageUrlService,
                { provide: HttpService, useValue: httpServiceMock },
                {
                    provide: ENVIRONMENT_CONFIG,
                    useValue: {
                        accessControlUrl: 'http://localhost:3000/auth',
                        appName: 'Test',
                        baseUrl: 'http://localhost:3000',
                        cookieName: 'session',
                        webApiPath: ''
                    }
                }
            ]
        });

        service = TestBed.inject(PageHttpService);
    });

    describe('load', () => {
        it('should GET the resolved URL with the given query parameters', () => {
            const response: PageBackendResponse = { globalActions: [], results: [], search: { filters: [], page: 1, size: 25 } };

            httpServiceMock.get.mockImplementation((_url, options?: HttpRequestOptions) => {
                options?.onSuccess?.(response);

                return null as never;
            });

            let emitted: PageBackendResponse | undefined;
            service.load('/products', { page: 1, size: 25 }).subscribe(result => (emitted = result));

            expect(httpServiceMock.get).toHaveBeenCalledWith(
                'http://localhost:3000/products',
                expect.objectContaining({ queryParams: { page: 1, size: 25 } })
            );
            expect(emitted).toBe(response);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 500 });

            httpServiceMock.get.mockImplementation((_url, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service.load('/products', {}).subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('deleteItems', () => {
        it('should DELETE with the ids body and the given success toast', () => {
            httpServiceMock.delete.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.();

                return null as never;
            });

            let completed = false;
            service.deleteItems('/products', ['1', '2'], 'my.prefix.delete.success').subscribe({
                complete: () => (completed = true)
            });

            expect(httpServiceMock.delete).toHaveBeenCalledWith(
                'http://localhost:3000/products',
                { ids: ['1', '2'] },
                expect.objectContaining({ successToast: 'my.prefix.delete.success' })
            );
            expect(completed).toBe(true);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 403 });

            httpServiceMock.delete.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service.deleteItems('/products', ['1'], 'my.prefix.delete.success').subscribe({
                error: error_ => (emittedError = error_)
            });

            expect(emittedError).toBe(error);
        });
    });

    describe('create', () => {
        it('should POST the value to the resolved URL with the given success toast', () => {
            const created = { id: '1', name: 'Oats' };

            httpServiceMock.post.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(created);

                return null as never;
            });

            let emitted: unknown;
            service.create('/products', { name: 'Oats' }, 'my.prefix.save.success').subscribe(result => (emitted = result));

            expect(httpServiceMock.post).toHaveBeenCalledWith(
                'http://localhost:3000/products',
                { name: 'Oats' },
                expect.objectContaining({ successToast: 'my.prefix.save.success' })
            );
            expect(emitted).toBe(created);
        });
    });

    describe('edit', () => {
        it('should PUT the value to the resolved URL with the id appended', () => {
            const updated = { id: '1', name: 'Oats 1kg' };

            httpServiceMock.put.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(updated);

                return null as never;
            });

            let emitted: unknown;
            service.edit('/products', '1', { name: 'Oats 1kg' }, 'my.prefix.save.success').subscribe(result => (emitted = result));

            expect(httpServiceMock.put).toHaveBeenCalledWith(
                'http://localhost:3000/products/1',
                { name: 'Oats 1kg' },
                expect.objectContaining({ successToast: 'my.prefix.save.success' })
            );
            expect(emitted).toBe(updated);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 400 });

            httpServiceMock.put.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service.edit('/products', '1', {}, 'my.prefix.save.success').subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });
});
