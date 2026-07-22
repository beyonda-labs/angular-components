import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';
import { HttpService } from '../../../services/http/http.service';
import { HttpRequestOptions } from '../../../services/http/models/http.model';
import { PageBackendResponse } from '../models/page.model';
import { PageItemType } from '../models/page-categories.model';
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
            const response: PageBackendResponse = {
                globalActions: [],
                results: [],
                search: { filters: [], page: 1, size: 25 }
            };

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

    describe('loadTrash', () => {
        it('should GET the trash sub-path with the given query parameters', () => {
            const response: PageBackendResponse = {
                globalActions: [],
                results: [],
                search: { filters: [], page: 1, size: 25 }
            };

            httpServiceMock.get.mockImplementation((_url, options?: HttpRequestOptions) => {
                options?.onSuccess?.(response);

                return null as never;
            });

            let emitted: PageBackendResponse | undefined;
            service.loadTrash('/products', { page: 1, size: 25 }).subscribe(result => (emitted = result));

            expect(httpServiceMock.get).toHaveBeenCalledWith(
                'http://localhost:3000/products/trash',
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
            service.loadTrash('/products', {}).subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('loadCategoryPath', () => {
        it('should GET the category path sub-path for the given category id', () => {
            const path = [{ id: 'root-cat' }, { id: 'sub-cat' }];

            httpServiceMock.get.mockImplementation((_url, options?: HttpRequestOptions) => {
                options?.onSuccess?.(path);

                return null as never;
            });

            let emitted: unknown;
            service.loadCategoryPath('/products', 'sub-cat').subscribe(result => (emitted = result));

            expect(httpServiceMock.get).toHaveBeenCalledWith(
                'http://localhost:3000/products/categories/sub-cat/path',
                expect.objectContaining({})
            );
            expect(emitted).toBe(path);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 500 });

            httpServiceMock.get.mockImplementation((_url, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service.loadCategoryPath('/products', 'sub-cat').subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('deleteItems', () => {
        it('should DELETE with the ids body and the given success toast', () => {
            httpServiceMock.delete.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(null);

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
            service
                .create('/products', { name: 'Oats' }, 'my.prefix.save.success')
                .subscribe(result => (emitted = result));

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
            service
                .edit('/products', '1', { name: 'Oats 1kg' }, 'my.prefix.save.success')
                .subscribe(result => (emitted = result));

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
            service
                .edit('/products', '1', {}, 'my.prefix.save.success')
                .subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('createCategory', () => {
        it('should POST the value to the categories sub-path with the given success toast', () => {
            const created = { id: '1', name: 'Cereals' };

            httpServiceMock.post.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(created);

                return null as never;
            });

            let emitted: unknown;
            service
                .createCategory('/products', { name: 'Cereals' }, 'my.prefix.save.success')
                .subscribe(result => (emitted = result));

            expect(httpServiceMock.post).toHaveBeenCalledWith(
                'http://localhost:3000/products/categories',
                { name: 'Cereals' },
                expect.objectContaining({ successToast: 'my.prefix.save.success' })
            );
            expect(emitted).toBe(created);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 400 });

            httpServiceMock.post.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service
                .createCategory('/products', {}, 'my.prefix.save.success')
                .subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('editCategory', () => {
        it('should PUT the value to the categories sub-path with the id appended', () => {
            const updated = { id: '1', name: 'Cereals' };

            httpServiceMock.put.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(updated);

                return null as never;
            });

            let emitted: unknown;
            service
                .editCategory('/products', '1', { name: 'Cereals' }, 'my.prefix.save.success')
                .subscribe(result => (emitted = result));

            expect(httpServiceMock.put).toHaveBeenCalledWith(
                'http://localhost:3000/products/categories/1',
                { name: 'Cereals' },
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
            service
                .editCategory('/products', '1', {}, 'my.prefix.save.success')
                .subscribe({ error: error_ => (emittedError = error_) });

            expect(emittedError).toBe(error);
        });
    });

    describe('deleteCategories', () => {
        it('should DELETE with the ids body on the categories sub-path', () => {
            httpServiceMock.delete.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(null);

                return null as never;
            });

            let completed = false;
            service.deleteCategories('/products', ['1', '2'], 'my.prefix.delete.success').subscribe({
                complete: () => (completed = true)
            });

            expect(httpServiceMock.delete).toHaveBeenCalledWith(
                'http://localhost:3000/products/categories',
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
            service.deleteCategories('/products', ['1'], 'my.prefix.delete.success').subscribe({
                error: error_ => (emittedError = error_)
            });

            expect(emittedError).toBe(error);
        });
    });

    describe('deleteTrashItems', () => {
        it('should DELETE with the items body on the trash sub-path', () => {
            const items = [{ id: '1', type: PageItemType.Item }];

            httpServiceMock.delete.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(null);

                return null as never;
            });

            let completed = false;
            service.deleteTrashItems('/products', items, 'my.prefix.delete.success').subscribe({
                complete: () => (completed = true)
            });

            expect(httpServiceMock.delete).toHaveBeenCalledWith(
                'http://localhost:3000/products/trash',
                { items },
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
            service
                .deleteTrashItems('/products', [{ id: '1', type: PageItemType.Item }], 'my.prefix.delete.success')
                .subscribe({
                    error: error_ => (emittedError = error_)
                });

            expect(emittedError).toBe(error);
        });
    });

    describe('restoreTrashItems', () => {
        it('should PUT the items body on the trash sub-path', () => {
            const items = [{ id: '1', type: PageItemType.Category }];

            httpServiceMock.put.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onSuccess?.(null);

                return null as never;
            });

            let completed = false;
            service.restoreTrashItems('/products', items, 'my.prefix.restore.success').subscribe({
                complete: () => (completed = true)
            });

            expect(httpServiceMock.put).toHaveBeenCalledWith(
                'http://localhost:3000/products/trash',
                { items },
                expect.objectContaining({ successToast: 'my.prefix.restore.success' })
            );
            expect(completed).toBe(true);
        });

        it('should propagate a request error', () => {
            const error = new HttpErrorResponse({ status: 403 });

            httpServiceMock.put.mockImplementation((_url, _body, options?: HttpRequestOptions) => {
                options?.onError?.(error);

                return null as never;
            });

            let emittedError: unknown;
            service
                .restoreTrashItems('/products', [{ id: '1', type: PageItemType.Category }], 'my.prefix.restore.success')
                .subscribe({
                    error: error_ => (emittedError = error_)
                });

            expect(emittedError).toBe(error);
        });
    });
});
