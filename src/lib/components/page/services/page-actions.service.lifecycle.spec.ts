import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageLifecycleActionsService } from './page-lifecycle-actions.service';

describe('PageActionsService — duplicate and change status', () => {
    const changeStatus = jest.fn();
    const duplicate = jest.fn();
    const emptyTrash = jest.fn();
    let service: PageActionsService;

    function buildContext(selectedItems: PageItem[]): PageActionsContext {
        return {
            config: new PageConfig({ baseUrl: '/items', prefix: 'testPage' }),
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

    function run(key: PageStandardAction, context: PageActionsContext): void {
        service.executeAction(
            new PageAction({ key, scope: PageActionScope.Single, zone: PageActionZone.Menu }),
            context
        );
    }

    beforeEach(() => {
        jest.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PageLifecycleActionsService, useValue: { changeStatus, duplicate, emptyTrash } }
            ]
        });
        service = TestBed.inject(PageActionsService);
    });

    it('duplicates or changes the status of exactly one selected row, reloading once saved', () => {
        const row = { id: 1 };
        const context = buildContext([row]);

        run(PageStandardAction.Duplicate, context);
        run(PageStandardAction.ChangeStatus, context);
        (duplicate.mock.calls[0][2] as () => void)();

        expect(duplicate).toHaveBeenCalledWith(context.config, row, expect.any(Function));
        expect(changeStatus).toHaveBeenCalledWith(context.config, row, expect.any(Function));
        expect(context.onSaved).toHaveBeenCalled();
    });

    it('empties the trash whatever is selected, reloading the trash afterwards', () => {
        const context = buildContext([]);

        run(PageStandardAction.EmptyTrash, context);
        (emptyTrash.mock.calls[0][2] as () => void)();

        expect(emptyTrash).toHaveBeenCalledWith(context.config, expect.any(PageAction), expect.any(Function));
        expect(context.onTrashItemDeleted).toHaveBeenCalled();
    });

    it('neither duplicates nor changes the status of several rows at once', () => {
        const context = buildContext([{ id: 1 }, { id: 2 }]);

        run(PageStandardAction.Duplicate, context);
        run(PageStandardAction.ChangeStatus, context);

        expect(duplicate).not.toHaveBeenCalled();
        expect(changeStatus).not.toHaveBeenCalled();
    });
});
