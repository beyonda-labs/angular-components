import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { PageItemType } from '../models/page-categories.model';
import { PageHttpService } from './page-http.service';

describe('PageHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: PageHttpService;
    let toast: FakeToastService;

    const trashItems = [{ id: 1, type: PageItemType.Item }];

    function answer(method: string, url: string): TestRequest {
        const request = httpTesting.expectOne(
            current => current.method === method && current.url === `https://api.test/api${url}`
        );

        request.flush({});

        return request;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PageHttpService);
        toast = TestBed.inject(FakeToastService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the list, the trash, a category path and the category tree from their endpoints', () => {
        service.load('/items', { search: 'x' }).subscribe();
        service.loadTrash('/items', { search: 'y' }).subscribe();
        service.loadCategoryPath('/items', 7).subscribe();
        service.loadCategoryTree('/items').subscribe();

        expect(answer('GET', '/items').request.params.toString()).toBe('search=x');
        expect(answer('GET', '/items/trash').request.params.toString()).toBe('search=y');
        answer('GET', '/items/categories/7/path');
        answer('GET', '/items/categories/tree');
    });

    it('creates and edits items and categories with the success toast', () => {
        service.create('/items', { name: 'a' }, 'created').subscribe();
        service.createCategory('/items', { name: 'b' }, 'category-created').subscribe();
        service.edit('/items', 1, { name: 'c' }, 'edited').subscribe();
        service.editCategory('/items', 2, { name: 'd' }, 'category-edited').subscribe();

        expect(answer('POST', '/items').request.body).toEqual({ name: 'a' });
        expect(answer('POST', '/items/categories').request.body).toEqual({ name: 'b' });
        expect(answer('PUT', '/items/1').request.body).toEqual({ name: 'c' });
        expect(answer('PUT', '/items/categories/2').request.body).toEqual({ name: 'd' });
        expect(toast.successes()).toEqual([
            { message: 'created' },
            { message: 'category-created' },
            { message: 'edited' },
            { message: 'category-edited' }
        ]);
    });

    it('deletes, moves and restores in bulk with the ids or the typed items as body', () => {
        service.deleteItems('/items', [1, 2], 'deleted').subscribe();
        service.deleteCategories('/items', [3], 'categories-deleted').subscribe();
        service.deleteTrashItems('/items', trashItems, 'trash-deleted').subscribe();
        service.moveItems('/items', trashItems, null, 'moved').subscribe();
        service.restoreTrashItems('/items', trashItems, 'restored').subscribe();

        expect(answer('DELETE', '/items').request.body).toEqual({ ids: [1, 2] });
        expect(answer('DELETE', '/items/categories').request.body).toEqual({ ids: [3] });
        expect(answer('DELETE', '/items/trash').request.body).toEqual({ items: trashItems });
        expect(answer('PUT', '/items/move').request.body).toEqual({ items: trashItems, targetId: null });
        expect(answer('PUT', '/items/trash').request.body).toEqual({ items: trashItems });
        expect(toast.successes()).toEqual([
            { message: 'deleted' },
            { message: 'categories-deleted' },
            { message: 'trash-deleted' },
            { message: 'moved' },
            { message: 'restored' }
        ]);
    });
});
