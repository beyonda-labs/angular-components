import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import { ModalTreeService } from '../../tree/components/modal/services/modal-tree.service';
import { PageConfig } from '../models/page.model';
import { PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService — move to a category', () => {
    const moveItems = jest.fn();
    const openTree = jest.fn();
    let service: PageActionsService;

    function buildContext(config = new PageConfig({ baseUrl: '/items', prefix: 'testPage' })): PageActionsContext {
        return {
            config,
            getCurrentCategoryId: () => null,
            onCategoryDeleted: jest.fn(),
            onCategoryFormModalOpened: jest.fn(),
            onCategorySaved: jest.fn(),
            onDeleted: jest.fn(),
            onFormModalOpened: jest.fn(),
            onMoved: jest.fn(),
            onSaved: jest.fn(),
            onTrashItemDeleted: jest.fn(),
            selectedItems: () => []
        };
    }

    beforeEach(() => {
        jest.clearAllMocks();
        moveItems.mockReturnValue(of(null));
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: ModalTreeService, useValue: { open: openTree } },
                { provide: PageHttpService, useValue: { moveItems } }
            ]
        });
        service = TestBed.inject(PageActionsService);
    });

    it('moves the given rows straight into a category, with the move toast and the refresh', () => {
        const context = buildContext();
        const onMoved = jest.fn();
        const rows: PageItem[] = [
            { actions: ['move'], id: 'item-1', type: PageItemType.Item } as PageItem,
            { actions: ['move'], id: 'cat-3', type: PageItemType.Category } as PageItem
        ];

        service.moveItems(context, rows, 'cat-1', onMoved);

        expect(moveItems).toHaveBeenCalledWith(
            '/items',
            [
                { id: 'item-1', type: PageItemType.Item },
                { id: 'cat-3', type: PageItemType.Category }
            ],
            'cat-1',
            'testPage.toast.move-success'
        );
        expect(openTree).not.toHaveBeenCalled();
        expect(onMoved).toHaveBeenCalled();
        expect(context.onMoved).toHaveBeenCalled();
    });

    it('sends no move without rows or without a base url', () => {
        service.moveItems(buildContext(), [], 'cat-1');
        service.moveItems(buildContext(new PageConfig({ prefix: 'testPage' })), [{ id: 'item-1' }], 'cat-1');

        expect(moveItems).not.toHaveBeenCalled();
    });
});
