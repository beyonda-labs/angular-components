import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { of } from 'rxjs';

import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';
import { PageUsagesConfig } from '../models/page-usages.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService — usages', () => {
    const OFFER = { id: 't-1', name: 'Offer', resource: 'templates' };
    const deleteItems = jest.fn();
    const findUsages = jest.fn();
    let modal: FakeModalService;
    let service: PageActionsService;

    function buildAction(key: string): PageAction {
        return new PageAction({ key, scope: PageActionScope.Item, zone: PageActionZone.Menu });
    }

    function buildContext(selectedItems: PageItem[]): PageActionsContext {
        return {
            config: new PageConfig({ baseUrl: '/items', prefix: 'testPage', usagesConfig: new PageUsagesConfig() }),
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
        deleteItems.mockReturnValue(of(null));
        TestBed.configureTestingModule({
            providers: [provideBeyTesting(), { provide: PageHttpService, useValue: { deleteItems, findUsages } }]
        });
        modal = TestBed.inject(FakeModalService);
        service = TestBed.inject(PageActionsService);
    });

    it('warns with the in-use texts of a delete when something uses the rows, then deletes', () => {
        modal.setConfirmationAnswer(true);
        findUsages.mockReturnValue(of([{ id: 'a', total: 1, users: [OFFER] }]));

        service.executeAction(buildAction(PageStandardAction.Delete), buildContext([{ id: 'a' }]));

        expect(findUsages).toHaveBeenCalledWith('/items', ['a']);
        expect(modal.confirmations()).toEqual([
            {
                message: 'testPage.modal.delete-in-use.message',
                messageParameters: { count: 1, usageCount: 1, users: 'Offer' },
                title: 'testPage.modal.delete-in-use.title'
            }
        ]);
        expect(deleteItems).toHaveBeenCalledWith('/items', ['a'], 'testPage.toast.delete-success');
    });

    it('hands the in-use confirmation of a permanent delete to the confirmation of the action', () => {
        findUsages.mockReturnValue(of([{ id: 'a', total: 1, users: [OFFER] }]));
        const confirmation = jest.fn((_items: PageItem[], built: ConfirmationModalConfig) => built);

        service.executeAction(
            new PageAction({ ...buildAction(PageStandardAction.DeleteTrashItem), confirmation }),
            buildContext([{ id: 'a' }])
        );

        expect(confirmation).toHaveBeenCalledWith(
            [{ id: 'a' }],
            expect.objectContaining({ title: 'testPage.modal.delete-trash-item-in-use.title' })
        );
    });

    it('keeps the standard confirmation when nothing uses the rows', () => {
        findUsages.mockReturnValue(of([{ id: 'a', total: 0, users: [] }]));

        service.executeAction(buildAction(PageStandardAction.Delete), buildContext([{ id: 'a' }]));

        expect(modal.confirmations()).toEqual([
            {
                message: 'testPage.modal.delete.message',
                messageParameters: { count: 1 },
                title: 'testPage.modal.delete.title'
            }
        ]);
    });

    it('never asks for the usages of a category delete', () => {
        service.executeAction(buildAction(PageStandardAction.DeleteCategory), buildContext([{ id: 'folder' }]));

        expect(findUsages).not.toHaveBeenCalled();
        expect(modal.confirmations()).toHaveLength(1);
    });
});
