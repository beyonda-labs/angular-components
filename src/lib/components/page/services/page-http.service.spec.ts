import { TestBed } from '@angular/core/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { HttpService } from '../../../services/http/http.service';
import { PageItemType } from '../models/page-categories.model';
import { PageHttpService } from './page-http.service';
import { PageUrlService } from './page-url.service';

describe('PageHttpService', () => {
    let service: PageHttpService;
    let httpService: MockProxy<HttpService>;

    const trashItems = [{ id: 1, type: PageItemType.Item }];

    beforeEach(() => {
        httpService = mock<HttpService>();
        httpService.get.mockReturnValue(of({}));
        httpService.post.mockReturnValue(of({}));
        httpService.put.mockReturnValue(of());
        httpService.delete.mockReturnValue(of());

        TestBed.configureTestingModule({
            providers: [
                { provide: HttpService, useValue: httpService },
                { provide: PageUrlService, useValue: { resolve: (path: string) => `https://api${path}` } }
            ]
        });

        service = TestBed.inject(PageHttpService);
    });

    it('reads the list, the trash, a category path and the category tree from their endpoints', () => {
        service.load('/items', { search: 'x' });
        service.loadTrash('/items', { search: 'y' });
        service.loadCategoryPath('/items', 7);
        service.loadCategoryTree('/items');

        expect(httpService.get.mock.calls).toEqual([
            ['https://api/items', { queryParams: { search: 'x' } }],
            ['https://api/items/trash', { queryParams: { search: 'y' } }],
            ['https://api/items/categories/7/path'],
            ['https://api/items/categories/tree']
        ]);
    });

    it('creates and edits items and categories with the success toast', () => {
        service.create('/items', { name: 'a' }, 'created');
        service.createCategory('/items', { name: 'b' }, 'category-created');
        service.edit('/items', 1, { name: 'c' }, 'edited');
        service.editCategory('/items', 2, { name: 'd' }, 'category-edited');

        expect(httpService.post.mock.calls).toEqual([
            ['https://api/items', { name: 'a' }, { successToast: 'created' }],
            ['https://api/items/categories', { name: 'b' }, { successToast: 'category-created' }]
        ]);
        expect(httpService.put.mock.calls).toEqual([
            ['https://api/items/1', { name: 'c' }, { successToast: 'edited' }],
            ['https://api/items/categories/2', { name: 'd' }, { successToast: 'category-edited' }]
        ]);
    });

    it('deletes, moves and restores in bulk with the ids or the typed items as body', () => {
        service.deleteItems('/items', [1, 2], 'deleted');
        service.deleteCategories('/items', [3], 'categories-deleted');
        service.deleteTrashItems('/items', trashItems, 'trash-deleted');
        service.moveItems('/items', trashItems, null, 'moved');
        service.restoreTrashItems('/items', trashItems, 'restored');

        expect(httpService.delete.mock.calls).toEqual([
            ['https://api/items', { ids: [1, 2] }, { successToast: 'deleted' }],
            ['https://api/items/categories', { ids: [3] }, { successToast: 'categories-deleted' }],
            ['https://api/items/trash', { items: trashItems }, { successToast: 'trash-deleted' }]
        ]);
        expect(httpService.put.mock.calls).toEqual([
            ['https://api/items/move', { items: trashItems, targetId: null }, { successToast: 'moved' }],
            ['https://api/items/trash', { items: trashItems }, { successToast: 'restored' }]
        ]);
    });
});
