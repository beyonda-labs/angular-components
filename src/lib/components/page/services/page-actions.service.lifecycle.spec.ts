import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormSection } from '../../form/models/form.model';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageFormService } from './page-form.service';
import { PageLifecycleActionsService } from './page-lifecycle-actions.service';

describe('PageActionsService — duplicate and change status', () => {
    const changeStatus = jest.fn();
    const duplicate = jest.fn();
    const emptyTrash = jest.fn();
    const openPageForm = jest.fn<object, [unknown, unknown]>(() => ({}));
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
                { provide: PageLifecycleActionsService, useValue: { changeStatus, duplicate, emptyTrash } },
                { provide: PageFormService, useValue: { open: openPageForm } }
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

    it('opens the edit form of the row it is given, or the category form for a category', () => {
        const itemForm = new PageFormConfig({
            buildSections: () => [new FormSection({ key: 'main', rows: [] })],
            prefix: 'item'
        });
        const categoryForm = new PageFormConfig({ buildSections: () => [], prefix: 'category' });
        const context = {
            ...buildContext([]),
            config: new PageConfig({
                baseUrl: '/items',
                formConfig: itemForm,
                prefix: 'testPage',
                tableConfig: new PageTableConfig({
                    categoriesConfig: new PageCategoriesConfig({ formConfig: categoryForm }),
                    columns: [],
                    loadRow: () => []
                })
            })
        };
        const item = { id: 1, type: PageItemType.Item };
        const category = { id: 2, type: PageItemType.Category };

        service.openEditForm(context, item);
        service.openEditForm(context, category);

        expect(openPageForm.mock.calls.map(([form, row]) => [form, row])).toEqual([
            [itemForm, item],
            [categoryForm, category]
        ]);
    });

    it('neither duplicates nor changes the status of several rows at once', () => {
        const context = buildContext([{ id: 1 }, { id: 2 }]);

        run(PageStandardAction.Duplicate, context);
        run(PageStandardAction.ChangeStatus, context);

        expect(duplicate).not.toHaveBeenCalled();
        expect(changeStatus).not.toHaveBeenCalled();
    });
});
