import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { pickInTreeDialog } from '@testing/tree-dialog';
import { of } from 'rxjs';

import { pageStandardAction } from '../functions/page-standard-actions';
import { PageActionsContext, PageConfig } from '../models/page.model';
import { PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

const ENTRIES = [
    { id: 'v1', type: PageItemType.Item },
    { id: 'f1', type: PageItemType.Category }
];
const FOLDER = { actions: ['move'], entryType: PageItemType.Category, id: 'f1' } as PageItem;
const VARIABLE = { actions: ['move'], entryType: PageItemType.Item, id: 'v1', type: 'string' } as PageItem;

describe('PageActionsService — an entry type field of its own', () => {
    const deleteTrashItems = jest.fn();
    const loadCategoryTree = jest.fn();
    const moveItems = jest.fn();
    const restoreTrashItems = jest.fn();
    let service: PageActionsService;

    function buildContext(selectedItems: PageItem[], categoriesConfig?: PageCategoriesConfig): PageActionsContext {
        return {
            config: new PageConfig({
                baseUrl: '/variables',
                prefix: 'demo',
                tableConfig: new PageTableConfig({ categoriesConfig, columns: [], loadRow: () => [] })
            }),
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

    beforeEach(() => {
        jest.clearAllMocks();
        deleteTrashItems.mockReturnValue(of(null));
        loadCategoryTree.mockReturnValue(of([]));
        moveItems.mockReturnValue(of(null));
        restoreTrashItems.mockReturnValue(of([]));
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                {
                    provide: PageHttpService,
                    useValue: { deleteTrashItems, loadCategoryTree, moveItems, restoreTrashItems }
                }
            ]
        });
        service = TestBed.inject(PageActionsService);
    });

    it('moves the rows as entries of the type their entry type field names', () => {
        const context = buildContext([VARIABLE, FOLDER], new PageCategoriesConfig({ typeField: 'entryType' }));

        service.executeAction(pageStandardAction(PageStandardAction.Move), context);
        pickInTreeDialog('demo.categories.root');

        expect(moveItems).toHaveBeenCalledWith('/variables', ENTRIES, null, 'demo.toast.move-success');
    });

    it('deletes and restores the trash items as entries of the type their entry type field names', () => {
        TestBed.inject(FakeModalService).setConfirmationAnswer(true);
        const context = buildContext([VARIABLE, FOLDER], new PageCategoriesConfig({ typeField: 'entryType' }));

        service.executeAction(pageStandardAction(PageStandardAction.DeleteTrashItem), context);
        service.executeAction(pageStandardAction(PageStandardAction.RestoreTrashItem), context);

        expect(deleteTrashItems).toHaveBeenCalledWith('/variables', ENTRIES, 'demo.toast.delete-trash-item-success');
        expect(restoreTrashItems).toHaveBeenCalledWith('/variables', ENTRIES, 'demo.toast.restore-trash-item-success');
    });

    it('sends every trash item as an item on a page without categories', () => {
        service.executeAction(
            pageStandardAction(PageStandardAction.RestoreTrashItem),
            buildContext([VARIABLE, FOLDER])
        );

        expect(restoreTrashItems).toHaveBeenCalledWith(
            '/variables',
            [
                { id: 'v1', type: PageItemType.Item },
                { id: 'f1', type: PageItemType.Item }
            ],
            'demo.toast.restore-trash-item-success'
        );
    });
});
