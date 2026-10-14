import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { pickInTreeDialog, treeDialogItems } from '@testing/tree-dialog';
import { of } from 'rxjs';

import { pageStandardAction } from '../functions/page-standard-actions';
import { PageActionsContext, PageConfig } from '../models/page.model';
import { PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageOwnedItem } from '../models/page-owner.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService — move to a category', () => {
    const loadCategoryTree = jest.fn();
    const moveItems = jest.fn();
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

    function render(): void {
        TestBed.inject(ApplicationRef).tick();
    }

    beforeEach(() => {
        jest.clearAllMocks();
        moveItems.mockReturnValue(of(null));
        TestBed.configureTestingModule({
            providers: [provideBeyTesting(), { provide: PageHttpService, useValue: { loadCategoryTree, moveItems } }]
        });
        service = TestBed.inject(PageActionsService);
    });

    it('moves the given rows straight into a category, with the move toast and the refresh', () => {
        const context = buildContext(buildFoldersConfig());
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
        expect(onMoved).toHaveBeenCalled();
        expect(context.onMoved).toHaveBeenCalled();
    });

    it('sends no move without rows or without a base url', () => {
        service.moveItems(buildContext(), [], 'cat-1');
        service.moveItems(buildContext(new PageConfig({ prefix: 'testPage' })), [{ id: 'item-1' }], 'cat-1');

        expect(moveItems).not.toHaveBeenCalled();
    });

    it('opens no picker on a page without categories', () => {
        service.executeAction(pageStandardAction(PageStandardAction.Move), buildContext(undefined, [{ id: 1 }]));

        expect(loadCategoryTree).not.toHaveBeenCalled();
    });

    it('moves the selected rows to the picked category, the selected folders and those below them disabled, and closes the picker', () => {
        jest.useFakeTimers();
        const rows: PageItem[] = [{ actions: ['move'], id: 'cat-3', type: PageItemType.Category } as PageItem];
        const context = buildContext(buildFoldersConfig(), rows);
        loadCategoryTree.mockReturnValue(
            of([
                { id: 'cat-1', name: 'Electronics', parentId: null },
                { id: 'cat-2', name: 'Phones', parentId: 'cat-1' },
                { id: 'cat-3', name: 'Books', parentId: null },
                { id: 'cat-4', name: 'Novels', parentId: 'cat-3' }
            ])
        );

        service.executeAction(pageStandardAction(PageStandardAction.Move), context);
        render();
        const disabled = textsOf(treeDialogItems().filter(item => item.getAttribute('aria-disabled') === 'true'));
        pickInTreeDialog('Phones');
        jest.runAllTimers();
        render();
        jest.useRealTimers();

        expect(loadCategoryTree).toHaveBeenCalledWith('/items', undefined);
        expect(disabled).toEqual(['Books', 'Novels']);
        expect(moveItems).toHaveBeenCalledWith(
            '/items',
            [{ id: 'cat-3', type: PageItemType.Category }],
            'cat-2',
            'testPage.toast.move-success'
        );
        expect(treeDialogItems()).toEqual([]);
        expect(context.onMoved).toHaveBeenCalled();
    });

    it('picks among the folders of the owner of the moved rows, the root among them', () => {
        const ada = { ownerId: 'ada', ownerName: 'Ada Lovelace' };
        const rows: (PageOwnedItem & { type: PageItemType })[] = [
            { ...ada, id: 'item-1', type: PageItemType.Item },
            { ...ada, id: 'cat-3', type: PageItemType.Category }
        ];
        loadCategoryTree.mockReturnValue(of([{ id: 'cat-1', name: 'Invoices', ownerId: 'ada', parentId: null }]));

        service.executeAction(pageStandardAction(PageStandardAction.Move), buildContext(buildFoldersConfig(), rows));
        render();
        const offered = textsOf(treeDialogItems());
        pickInTreeDialog('testPage.categories.root');

        expect(loadCategoryTree).toHaveBeenCalledWith('/items', 'ada');
        expect(offered).toEqual(['testPage.categories.root', 'Invoices']);
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

    it('picks inside a shared folder only among that folder and the folders below it', () => {
        const rows: (PageOwnedItem & { type: PageItemType })[] = [
            { id: 'item-1', ownerId: 'ada', ownerName: 'Ada', type: PageItemType.Item }
        ];
        loadCategoryTree.mockReturnValue(
            of([
                { id: 'home', name: 'Home', ownerId: 'ada', parentId: null },
                { id: 'clients', name: 'Clients', ownerId: 'ada', parentId: 'home' },
                { id: 'acme', name: 'Acme', ownerId: 'ada', parentId: 'clients' }
            ])
        );

        service.executeAction(pageStandardAction(PageStandardAction.Move), {
            ...buildContext(buildFoldersConfig(), rows),
            getSharedRoot: () => ({ id: 'clients', label: 'Clients' })
        });
        render();
        const offered = textsOf(treeDialogItems());
        pickInTreeDialog('Acme');

        expect(offered).toEqual(['Clients', 'Acme']);
        expect(moveItems).toHaveBeenCalledWith(
            '/items',
            [{ id: 'item-1', type: PageItemType.Item }],
            'acme',
            'testPage.toast.move-success'
        );
    });
});
