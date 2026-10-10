import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import { ModalTreeConfig } from '../../tree/components/modal/models/modal-tree.model';
import { ModalTreeService } from '../../tree/components/modal/services/modal-tree.service';
import { pageStandardAction } from '../functions/page-standard-actions';
import { PageConfig } from '../models/page.model';
import { PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageOwnedItem } from '../models/page-owner.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService — move to a category', () => {
    const loadCategoryTree = jest.fn();
    const moveItems = jest.fn();
    const openTree = jest.fn();
    let service: PageActionsService;

    function buildContext(
        config = new PageConfig({ baseUrl: '/items', prefix: 'testPage' }),
        selectedItems: PageItem[] = []
    ): PageActionsContext {
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
            selectedItems: () => selectedItems
        };
    }

    function buildFoldersConfig(): PageConfig {
        return new PageConfig({
            baseUrl: '/items',
            prefix: 'testPage',
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                loadRow: () => []
            })
        });
    }

    beforeEach(() => {
        jest.clearAllMocks();
        moveItems.mockReturnValue(of(null));
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: ModalTreeService, useValue: { open: openTree } },
                { provide: PageHttpService, useValue: { loadCategoryTree, moveItems } }
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

    it('picks among the folders of the owner of the moved rows, the root among them', () => {
        const ada = { ownerId: 'ada', ownerName: 'Ada Lovelace' };
        const rows: (PageOwnedItem & { type: PageItemType })[] = [
            { ...ada, id: 'item-1', type: PageItemType.Item },
            { ...ada, id: 'cat-3', type: PageItemType.Category }
        ];
        loadCategoryTree.mockReturnValue(of([{ id: 'cat-1', name: 'Invoices', ownerId: 'ada', parentId: null }]));
        openTree.mockReturnValue({ hide: jest.fn() });

        service.executeAction(pageStandardAction(PageStandardAction.Move), buildContext(buildFoldersConfig(), rows));
        const treeConfig = openTree.mock.calls[0][0] as ModalTreeConfig;
        const [root] = treeConfig.treeConfig.nodes;
        treeConfig.onConfirm?.(root);

        expect(loadCategoryTree).toHaveBeenCalledWith('/items', 'ada');
        expect(root.children.map(node => node.key)).toEqual(['cat-1']);
        expect(moveItems).toHaveBeenCalledWith(
            '/items',
            [
                { id: 'item-1', type: PageItemType.Item },
                { id: 'cat-3', type: PageItemType.Category }
            ],
            null,
            'testPage.toast.move-success'
        );
    });
});
