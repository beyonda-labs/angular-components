import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { of, Subject } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormHandle, FormSection } from '../../form/models/form.model';
import { ModalTreeConfig } from '../../tree/components/modal/models/modal-tree.model';
import { ModalTreeService } from '../../tree/components/modal/services/modal-tree.service';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageTrashItem } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService', () => {
    let modal: FakeModalService;
    let service: PageActionsService;

    const openForm = jest.fn();
    const openWithRequest = jest.fn();
    const openTree = jest.fn();
    const create = jest.fn();
    const createCategory = jest.fn();
    const deleteCategories = jest.fn();
    const deleteItems = jest.fn();
    const deleteTrashItems = jest.fn();
    const edit = jest.fn();
    const editCategory = jest.fn();
    const loadCategoryTree = jest.fn();
    const moveItems = jest.fn();
    const restoreTrashItems = jest.fn();

    beforeEach(() => {
        openForm.mockReset();
        openTree.mockReset();
        create.mockReset();
        createCategory.mockReset();
        deleteCategories.mockReset();
        deleteItems.mockReset();
        deleteTrashItems.mockReset();
        edit.mockReset();
        editCategory.mockReset();
        loadCategoryTree.mockReset();
        moveItems.mockReset();
        restoreTrashItems.mockReset();

        openForm.mockReturnValue({});

        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                PageActionsService,
                { provide: ModalTreeService, useValue: { open: openTree } },
                { provide: PageFormService, useValue: { open: openForm, openWithRequest } },
                {
                    provide: PageHttpService,
                    useValue: {
                        create,
                        createCategory,
                        deleteCategories,
                        deleteItems,
                        deleteTrashItems,
                        edit,
                        editCategory,
                        loadCategoryTree,
                        moveItems,
                        restoreTrashItems
                    }
                }
            ]
        });

        modal = TestBed.inject(FakeModalService);
        service = TestBed.inject(PageActionsService);
    });

    it('opens a form with its own request through the page forms', () => {
        const config = new ModalFormConfig({ prefix: 'testPage.status', sections: [] });
        const submit = jest.fn();
        const onSaved = jest.fn();

        service.openRequestForm(config, submit, onSaved);

        expect(openWithRequest).toHaveBeenCalledWith(config, submit, onSaved);
    });

    it('runs a custom item handler with the selected items', () => {
        const handler = jest.fn();
        const selected: PageItem[] = [{ id: 1 }];
        const context = buildContext({ selectedItems: () => selected });

        service.executeAction(buildAction('custom', PageActionScope.Item, handler), context);

        expect(handler).toHaveBeenCalledWith(selected);
    });

    it('runs a custom global handler with no rows', () => {
        const handler = jest.fn();

        service.executeAction(buildAction('custom', PageActionScope.Global, handler), buildContext());

        expect(handler).toHaveBeenCalledWith([]);
    });

    it('runs a custom single-row handler with the selected row', () => {
        const handler = jest.fn();
        const context = buildContext({ selectedItems: () => [{ id: 4 }] });

        service.executeAction(buildAction('custom', PageActionScope.Single, handler), context);

        expect(handler).toHaveBeenCalledWith([{ id: 4 }]);
    });

    it('hands a custom handler only the selected rows that are not categories', () => {
        const handler = jest.fn();
        const item = { id: 'item-1', type: PageItemType.Item };
        const context = buildCategoryContext({
            selectedItems: () => [{ id: 'cat-1', type: PageItemType.Category }, item]
        });

        service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item, handler), context);

        expect(handler).toHaveBeenCalledWith([item]);
        expect(deleteItems).not.toHaveBeenCalled();
    });

    it('does nothing for an unrecognized standard action key', () => {
        expect(() =>
            service.executeAction(buildAction('not-a-real-action', PageActionScope.Global), buildContext())
        ).not.toThrow();

        expect(openForm).not.toHaveBeenCalled();
        expect(modal.confirmations()).toEqual([]);
    });

    describe('create / edit item', () => {
        it('opens the create modal form and registers its reference', () => {
            const context = buildContext();

            service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

            expect(openForm).toHaveBeenCalledWith(
                context.config.formConfig,
                undefined,
                'testPage',
                expect.any(Function)
            );
            expect(context.onFormModalOpened).toHaveBeenCalled();
        });

        it('does not open the create modal form without a form config', () => {
            const context = buildContext({ config: new PageConfig({ prefix: 'testPage', baseUrl: '/items' }) });

            service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

            expect(openForm).not.toHaveBeenCalled();
        });

        it('opens the edit modal form only with exactly one selected item', () => {
            const item: PageItem = { id: 1 };
            const context = buildContext({ selectedItems: () => [item] });

            service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

            expect(openForm).toHaveBeenCalledWith(context.config.formConfig, item, 'testPage', expect.any(Function));
        });

        it('does not open the edit modal form with multiple selected items', () => {
            const context = buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

            service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

            expect(openForm).not.toHaveBeenCalled();
        });

        it('creates the item and closes the modal form when saving succeeds', () => {
            create.mockReturnValue(of({}));
            const context = buildContext();

            service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

            const close = jest.fn();
            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'New' }, { close } as unknown as FormHandle);

            expect(create).toHaveBeenCalledWith('/items', { name: 'New' }, 'testPage.toast.create-success');
            expect(close).toHaveBeenCalled();
            expect(context.onSaved).toHaveBeenCalled();
        });

        it('edits the item through the http service when saving an edit', () => {
            edit.mockReturnValue(of({}));
            const item: PageItem = { id: 7 };
            const context = buildContext({ selectedItems: () => [item] });

            service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'Edited' }, { close: jest.fn() } as unknown as FormHandle);

            expect(edit).toHaveBeenCalledWith('/items', 7, { name: 'Edited' }, 'testPage.toast.edit-success');
        });

        it('creates the item with the current category id as parent when categories are enabled', () => {
            create.mockReturnValue(of({}));
            const context = buildCategoryContext();

            service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'New' }, { close: jest.fn() } as unknown as FormHandle);

            expect(create).toHaveBeenCalledWith(
                '/items',
                { name: 'New', parentId: 'category-1' },
                'testPage.toast.create-success'
            );
        });

        it('does not merge the parent id when editing an item of a categorized page', () => {
            edit.mockReturnValue(of({}));
            const item: PageItem = { id: 7 };
            const context = buildCategoryContext({ selectedItems: () => [item] });

            service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'Edited' }, { close: jest.fn() } as unknown as FormHandle);

            expect(edit).toHaveBeenCalledWith('/items', 7, { name: 'Edited' }, 'testPage.toast.edit-success');
        });
    });

    describe('delete item', () => {
        it('deletes the selected items after confirmation', () => {
            modal.setConfirmationAnswer(true);
            deleteItems.mockReturnValue(of(null));
            const context = buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

            service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), context);

            expect(modal.confirmations()).toHaveLength(1);
            expect(deleteItems).toHaveBeenCalledWith('/items', [1, 2], 'testPage.toast.delete-success');
            expect(context.onDeleted).toHaveBeenCalled();
        });

        it('does not delete when the confirmation is rejected', () => {
            const context = buildContext({ selectedItems: () => [{ id: 1 }] });

            service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), context);

            expect(deleteItems).not.toHaveBeenCalled();
        });

        it('does not ask for confirmation without selected items', () => {
            service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), buildContext());

            expect(modal.confirmations()).toEqual([]);
        });
    });

    describe('create / edit category', () => {
        it('opens the category modal form using the category form prefix', () => {
            const context = buildCategoryContext();

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            expect(openForm).toHaveBeenCalledWith(
                context.config.tableConfig?.categoriesConfig?.formConfig,
                undefined,
                'testPage.category.form',
                expect.any(Function)
            );
        });

        it('does not open the category modal form without a categories config', () => {
            const context = buildContext();

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            expect(openForm).not.toHaveBeenCalled();
        });

        it('opens the category modal form at root, without a current category id', () => {
            const context = buildCategoryContext({ getCurrentCategoryId: () => null });

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            expect(openForm).toHaveBeenCalledWith(
                context.config.tableConfig?.categoriesConfig?.formConfig,
                undefined,
                'testPage.category.form',
                expect.any(Function)
            );
        });

        it('does not open the category modal form without a categories form config', () => {
            const context = buildCategoryContext({
                config: new PageConfig({
                    baseUrl: '/items',
                    prefix: 'testPage',
                    tableConfig: new PageTableConfig({
                        columns: [],
                        categoriesConfig: new PageCategoriesConfig({}),
                        loadRow: () => []
                    })
                })
            });

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            expect(openForm).not.toHaveBeenCalled();
        });

        it('opens the edit category modal form only with exactly one selected item', () => {
            const item: PageItem = { id: 1 };
            const context = buildCategoryContext({ selectedItems: () => [item] });

            service.executeAction(buildAction(PageStandardAction.EditCategory, PageActionScope.Item), context);

            expect(openForm).toHaveBeenCalledWith(
                context.config.tableConfig?.categoriesConfig?.formConfig,
                item,
                'testPage.category.form',
                expect.any(Function)
            );
        });

        it('does not open the edit category modal form with multiple selected items', () => {
            const context = buildCategoryContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

            service.executeAction(buildAction(PageStandardAction.EditCategory, PageActionScope.Item), context);

            expect(openForm).not.toHaveBeenCalled();
        });

        it('creates the category with the current category id as parent, and closes the modal form when saving succeeds', () => {
            createCategory.mockReturnValue(of({}));
            const context = buildCategoryContext();

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            const close = jest.fn();
            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'New category' }, { close } as unknown as FormHandle);

            expect(createCategory).toHaveBeenCalledWith(
                '/items',
                { name: 'New category', parentId: 'category-1' },
                'testPage.toast.create-category-success'
            );
            expect(close).toHaveBeenCalled();
            expect(context.onCategorySaved).toHaveBeenCalled();
        });

        it('creates a root category with a null parent id when there is no current category', () => {
            createCategory.mockReturnValue(of({}));
            const context = buildCategoryContext({ getCurrentCategoryId: () => null });

            service.executeAction(buildAction(PageStandardAction.CreateCategory, PageActionScope.Global), context);

            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'Root category' }, { close: jest.fn() } as unknown as FormHandle);

            expect(createCategory).toHaveBeenCalledWith(
                '/items',
                { name: 'Root category', parentId: null },
                'testPage.toast.create-category-success'
            );
        });

        it('edits the category through the http service when saving an edit', () => {
            editCategory.mockReturnValue(of({}));
            const item: PageItem = { id: 9 };
            const context = buildCategoryContext({ selectedItems: () => [item] });

            service.executeAction(buildAction(PageStandardAction.EditCategory, PageActionScope.Item), context);

            const onSave = openForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

            onSave({ name: 'Edited category' }, { close: jest.fn() } as unknown as FormHandle);

            expect(editCategory).toHaveBeenCalledWith(
                '/items',
                9,
                { name: 'Edited category' },
                'testPage.toast.edit-category-success'
            );
            expect(context.onCategorySaved).toHaveBeenCalled();
        });
    });

    describe('confirmation hook', () => {
        it('asks with the confirmation the action builds from the rows and the default one, then deletes', () => {
            modal.setConfirmationAnswer(true);
            deleteItems.mockReturnValue(of(null));
            const confirmation = jest.fn((items: PageItem[], defaults: { title: string }) => ({
                message: 'testPage.modal.delete-in-use.message',
                messageParameters: { count: items.length },
                title: defaults.title
            }));
            const action = new PageAction({
                ...buildAction(PageStandardAction.Delete, PageActionScope.Item),
                confirmation
            });

            service.executeAction(action, buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] }));

            expect(confirmation).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }], {
                message: 'testPage.modal.delete.message',
                messageParameters: { count: 2 },
                title: 'testPage.modal.delete.title'
            });
            expect(modal.confirmations()).toEqual([
                {
                    message: 'testPage.modal.delete-in-use.message',
                    messageParameters: { count: 2 },
                    title: 'testPage.modal.delete.title'
                }
            ]);
            expect(deleteItems).toHaveBeenCalledWith('/items', [1, 2], 'testPage.toast.delete-success');
        });

        it('waits for a confirmation built asynchronously before asking', () => {
            const built = new Subject<{ message: string; title: string }>();
            const action = new PageAction({
                ...buildAction(PageStandardAction.DeleteTrashItem, PageActionScope.Item),
                confirmation: () => built
            });

            service.executeAction(action, buildContext({ selectedItems: () => [{ id: 1 }] }));

            expect(modal.confirmations()).toEqual([]);

            built.next({ message: 'testPage.modal.in-use.message', title: 'testPage.modal.in-use.title' });

            expect(modal.confirmations()).toEqual([
                {
                    message: 'testPage.modal.in-use.message',
                    title: 'testPage.modal.in-use.title'
                }
            ]);
            expect(deleteTrashItems).not.toHaveBeenCalled();
        });
    });

    describe('delete category', () => {
        it('deletes the selected categories after confirmation', () => {
            modal.setConfirmationAnswer(true);
            deleteCategories.mockReturnValue(of(null));
            const context = buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

            service.executeAction(buildAction(PageStandardAction.DeleteCategory, PageActionScope.Item), context);

            expect(modal.confirmations()).toHaveLength(1);
            expect(deleteCategories).toHaveBeenCalledWith('/items', [1, 2], 'testPage.toast.delete-category-success');
            expect(context.onCategoryDeleted).toHaveBeenCalled();
        });

        it('does not delete categories when the confirmation is rejected', () => {
            const context = buildContext({ selectedItems: () => [{ id: 1 }] });

            service.executeAction(buildAction(PageStandardAction.DeleteCategory, PageActionScope.Item), context);

            expect(deleteCategories).not.toHaveBeenCalled();
        });
    });

    describe('move', () => {
        it('does nothing when the table has no categoriesConfig', () => {
            const context = buildContext({ selectedItems: () => [{ id: 1 }] });

            service.executeAction(buildAction(PageStandardAction.Move, PageActionScope.Item), context);

            expect(loadCategoryTree).not.toHaveBeenCalled();
        });

        it('moves the selected items to the confirmed category, closes the picker and refreshes', () => {
            const hide = jest.fn();
            loadCategoryTree.mockReturnValue(of(buildCategories()));
            moveItems.mockReturnValue(of(null));
            openTree.mockReturnValue({ hide });
            const context = buildCategoryContext({ selectedItems: () => [{ id: 'item-1', type: PageItemType.Item }] });

            service.executeAction(buildAction(PageStandardAction.Move, PageActionScope.Item), context);

            const treeConfig = openTree.mock.calls[0][0] as ModalTreeConfig;
            const target = treeConfig.treeConfig.nodes[0].children[0];

            treeConfig.onConfirm?.(target);

            expect(loadCategoryTree).toHaveBeenCalledWith('/items');
            expect(moveItems).toHaveBeenCalledWith(
                '/items',
                [{ id: 'item-1', type: PageItemType.Item }],
                'cat-1',
                'testPage.toast.move-success'
            );
            expect(hide).toHaveBeenCalled();
            expect(context.onMoved).toHaveBeenCalled();
        });

        it('moves to the root when the root node is confirmed', () => {
            loadCategoryTree.mockReturnValue(of(buildCategories()));
            moveItems.mockReturnValue(of(null));
            openTree.mockReturnValue({ hide: jest.fn() });
            const context = buildCategoryContext({ selectedItems: () => [{ id: 'item-1', type: PageItemType.Item }] });

            service.executeAction(buildAction(PageStandardAction.Move, PageActionScope.Item), context);

            const treeConfig = openTree.mock.calls[0][0] as ModalTreeConfig;
            const root = treeConfig.treeConfig.nodes[0];

            treeConfig.onConfirm?.(root);

            expect(moveItems).toHaveBeenCalledWith('/items', expect.anything(), null, 'testPage.toast.move-success');
        });
    });

    describe('trash items', () => {
        it('deletes the selected trash items after confirmation', () => {
            modal.setConfirmationAnswer(true);
            deleteTrashItems.mockReturnValue(of(null));
            const items: PageTrashItem[] = [
                { id: 1, type: PageItemType.Item },
                { id: 2, type: PageItemType.Category }
            ];
            const context = buildContext({ selectedItems: () => items });

            service.executeAction(buildAction(PageStandardAction.DeleteTrashItem, PageActionScope.Item), context);

            expect(modal.confirmations()).toHaveLength(1);
            expect(deleteTrashItems).toHaveBeenCalledWith('/items', items, 'testPage.toast.delete-trash-item-success');
            expect(context.onTrashItemDeleted).toHaveBeenCalled();
        });

        it('does not delete trash items when the confirmation is rejected', () => {
            const context = buildContext({ selectedItems: () => [{ id: 1, type: PageItemType.Item }] });

            service.executeAction(buildAction(PageStandardAction.DeleteTrashItem, PageActionScope.Item), context);

            expect(deleteTrashItems).not.toHaveBeenCalled();
        });

        it('restores the selected trash items without asking for confirmation', () => {
            restoreTrashItems.mockReturnValue(of([]));
            const items: PageTrashItem[] = [{ id: 3, type: PageItemType.Category }];
            const context = buildContext({ selectedItems: () => items });

            service.executeAction(buildAction(PageStandardAction.RestoreTrashItem, PageActionScope.Item), context);

            expect(modal.confirmations()).toEqual([]);
            expect(restoreTrashItems).toHaveBeenCalledWith(
                '/items',
                items,
                'testPage.toast.restore-trash-item-success'
            );
            expect(context.onSaved).toHaveBeenCalled();
        });

        it('does not restore trash items without selected items', () => {
            service.executeAction(
                buildAction(PageStandardAction.RestoreTrashItem, PageActionScope.Item),
                buildContext()
            );

            expect(restoreTrashItems).not.toHaveBeenCalled();
        });
    });

    describe('buildHeaderActions', () => {
        it('builds header actions only for the requested zone', () => {
            const execute = jest.fn();
            const actions = [
                buildAction('left-action', PageActionScope.Global),
                new PageAction({ key: 'menu-action', scope: PageActionScope.Global, zone: PageActionZone.Menu })
            ];

            const headerActions = service.buildHeaderActions(actions, PageActionZone.Left, execute);

            expect(headerActions).toHaveLength(1);
            expect(headerActions[0].key).toBe('left-action');

            headerActions[0].action?.();

            expect(execute).toHaveBeenCalledWith(actions[0]);
        });

        it('builds nested header actions for sub-actions', () => {
            const execute = jest.fn();
            const subAction = new PageAction({
                key: 'sub-action',
                scope: PageActionScope.Global,
                zone: PageActionZone.Left
            });
            const action = new PageAction({
                key: 'parent-action',
                scope: PageActionScope.Global,
                subActions: [subAction],
                zone: PageActionZone.Left
            });

            const headerActions = service.buildHeaderActions([action], PageActionZone.Left, execute);

            expect(headerActions[0].subActions).toHaveLength(1);

            headerActions[0].subActions?.[0].action?.();

            expect(execute).toHaveBeenCalledWith(subAction);
        });
    });

    it('filters visible actions by backend keys and selection', () => {
        const actions = [
            buildAction(PageStandardAction.Create, PageActionScope.Global),
            buildAction(PageStandardAction.Edit, PageActionScope.Item),
            buildAction(PageStandardAction.Delete, PageActionScope.Item)
        ];
        const selected: PageItem[] = [{ actions: [PageStandardAction.Delete], id: 1 }];

        const visible = service.filterVisibleActions(actions, [PageStandardAction.Create], selected);

        expect(visible.map(action => action.key)).toEqual([PageStandardAction.Create, PageStandardAction.Delete]);
    });

    describe('filterVisibleActions — group scope', () => {
        it('keeps the group with both sub-actions when both are allowed', () => {
            const visible = service.filterVisibleActions(
                [buildGroupAction()],
                [PageStandardAction.Create, PageStandardAction.CreateCategory],
                []
            );

            expect(visible).toHaveLength(1);
            expect(visible[0].subActions?.map(action => action.key)).toEqual([
                PageStandardAction.Create,
                PageStandardAction.CreateCategory
            ]);
        });

        it('keeps the group with only the allowed sub-action when just one is allowed', () => {
            const visible = service.filterVisibleActions([buildGroupAction()], [PageStandardAction.Create], []);

            expect(visible).toHaveLength(1);
            expect(visible[0].subActions?.map(action => action.key)).toEqual([PageStandardAction.Create]);
        });

        it('drops the group entirely when no sub-action is allowed', () => {
            const visible = service.filterVisibleActions([buildGroupAction()], [], []);

            expect(visible).toHaveLength(0);
        });

        it('does not require the group key itself to be an allowed backend key', () => {
            const visible = service.filterVisibleActions(
                [buildGroupAction()],
                [PageStandardAction.Create, PageStandardAction.CreateCategory],
                []
            );

            expect(visible[0].key).toBe('createGroup');
        });

        it('does not mutate the original group action across repeated calls', () => {
            const group = buildGroupAction();

            service.filterVisibleActions([group], [PageStandardAction.Create], []);
            const secondCall = service.filterVisibleActions(
                [group],
                [PageStandardAction.Create, PageStandardAction.CreateCategory],
                []
            );

            expect(group.subActions).toHaveLength(2);
            expect(secondCall[0].subActions).toHaveLength(2);
        });
    });
});

function buildAction(key: string, scope: PageActionScope, handler?: (items: PageItem[]) => void): PageAction {
    return new PageAction({ handler, key, scope, zone: PageActionZone.Left });
}

function buildGroupAction(): PageAction {
    return new PageAction({
        key: 'createGroup',
        scope: PageActionScope.Group,
        zone: PageActionZone.Right,
        subActions: [
            buildAction(PageStandardAction.Create, PageActionScope.Global),
            buildAction(PageStandardAction.CreateCategory, PageActionScope.Global)
        ]
    });
}

function buildContext(overrides?: Partial<PageActionsContext>): PageActionsContext {
    return {
        config: new PageConfig({
            baseUrl: '/items',
            formConfig: new PageFormConfig({
                buildSections: () => [new FormSection({ key: 'section1', rows: [] })],
                prefix: 'testPage.form'
            }),
            prefix: 'testPage'
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
        selectedItems: () => [],
        ...overrides
    };
}

function buildCategoryContext(overrides?: Partial<PageActionsContext>): PageActionsContext {
    return buildContext({
        config: new PageConfig({
            baseUrl: '/items',
            formConfig: new PageFormConfig({
                buildSections: () => [new FormSection({ key: 'section1', rows: [] })],
                prefix: 'testPage.form'
            }),
            prefix: 'testPage',
            tableConfig: new PageTableConfig({
                columns: [],
                loadRow: () => [],
                categoriesConfig: new PageCategoriesConfig({
                    formConfig: new PageFormConfig({
                        buildSections: () => [new FormSection({ key: 'category-section', rows: [] })],
                        prefix: 'testPage.category.form'
                    })
                })
            })
        }),
        getCurrentCategoryId: () => 'category-1',
        ...overrides
    });
}

function buildCategories(): PageItem[] {
    return [
        { id: 'cat-1', name: 'Electronics', parentId: null },
        { id: 'cat-2', name: 'Phones', parentId: 'cat-1' },
        { id: 'cat-3', name: 'Books', parentId: null }
    ] as unknown as PageItem[];
}
