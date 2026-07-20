import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormSection } from '../../form/models/form.model';
import { ModalService } from '../../modal/services/modal.service';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

describe('PageActionsService', () => {
    let service: PageActionsService;

    const openConfirmation = jest.fn();
    const openForm = jest.fn();
    const create = jest.fn();
    const deleteItems = jest.fn();
    const edit = jest.fn();

    beforeEach(() => {
        openConfirmation.mockReset();
        openForm.mockReset();
        create.mockReset();
        deleteItems.mockReset();
        edit.mockReset();

        openForm.mockReturnValue({});

        TestBed.configureTestingModule({
            providers: [
                PageActionsService,
                { provide: ModalService, useValue: { openConfirmation } },
                { provide: PageFormService, useValue: { open: openForm } },
                { provide: PageHttpService, useValue: { create, deleteItems, edit } }
            ]
        });

        service = TestBed.inject(PageActionsService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should run a custom item handler with the selected items', () => {
        const handler = jest.fn();
        const selected: PageItem[] = [{ id: 1 }];
        const context = buildContext({ selectedItems: () => selected });

        service.executeAction(buildAction('custom', PageActionScope.Item, handler), context);

        expect(handler).toHaveBeenCalledWith(selected);
    });

    it('should run a custom global handler without items', () => {
        const handler = jest.fn();

        service.executeAction(buildAction('custom', PageActionScope.Global, handler), buildContext());

        expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('should open the create modal form and register its reference', () => {
        const context = buildContext();

        service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

        expect(openForm).toHaveBeenCalledWith(context.config.formConfig, undefined, 'testPage', expect.any(Function));
        expect(context.onFormModalOpened).toHaveBeenCalled();
    });

    it('should not open the create modal form without a form config', () => {
        const context = buildContext({ config: new PageConfig({ page: 'testPage', baseUrl: '/items' }) });

        service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

        expect(openForm).not.toHaveBeenCalled();
    });

    it('should open the edit modal form only with exactly one selected item', () => {
        const item: PageItem = { id: 1 };
        const context = buildContext({ selectedItems: () => [item] });

        service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

        expect(openForm).toHaveBeenCalledWith(context.config.formConfig, item, 'testPage', expect.any(Function));
    });

    it('should not open the edit modal form with multiple selected items', () => {
        const context = buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

        service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

        expect(openForm).not.toHaveBeenCalled();
    });

    it('should create the item and close the modal form when saving succeeds', () => {
        create.mockReturnValue(of({}));
        const context = buildContext();

        service.executeAction(buildAction(PageStandardAction.Create, PageActionScope.Global), context);

        const close = jest.fn();
        const onSave = openForm.mock.calls[0][3] as (value: unknown, form: ModalFormConfig) => void;

        onSave({ name: 'New' }, { close } as unknown as ModalFormConfig);

        expect(create).toHaveBeenCalledWith('/items', { name: 'New' }, 'testPage.save.success');
        expect(close).toHaveBeenCalled();
        expect(context.onSaved).toHaveBeenCalled();
    });

    it('should edit the item through the http service when saving an edit', () => {
        edit.mockReturnValue(of({}));
        const item: PageItem = { id: 7 };
        const context = buildContext({ selectedItems: () => [item] });

        service.executeAction(buildAction(PageStandardAction.Edit, PageActionScope.Item), context);

        const onSave = openForm.mock.calls[0][3] as (value: unknown, form: ModalFormConfig) => void;

        onSave({ name: 'Edited' }, { close: jest.fn() } as unknown as ModalFormConfig);

        expect(edit).toHaveBeenCalledWith('/items', 7, { name: 'Edited' }, 'testPage.save.success');
    });

    it('should delete the selected items after confirmation', () => {
        openConfirmation.mockReturnValue(of(true));
        deleteItems.mockReturnValue(of(null));
        const context = buildContext({ selectedItems: () => [{ id: 1 }, { id: 2 }] });

        service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), context);

        expect(openConfirmation).toHaveBeenCalled();
        expect(deleteItems).toHaveBeenCalledWith('/items', [1, 2], 'testPage.delete.success');
        expect(context.onDeleted).toHaveBeenCalled();
    });

    it('should not delete when the confirmation is rejected', () => {
        openConfirmation.mockReturnValue(of(false));
        const context = buildContext({ selectedItems: () => [{ id: 1 }] });

        service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), context);

        expect(deleteItems).not.toHaveBeenCalled();
    });

    it('should not ask for confirmation without selected items', () => {
        service.executeAction(buildAction(PageStandardAction.Delete, PageActionScope.Item), buildContext());

        expect(openConfirmation).not.toHaveBeenCalled();
    });

    it('should build header actions only for the requested zone', () => {
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

    it('should filter visible actions by backend keys and selection', () => {
        const actions = [
            buildAction(PageStandardAction.Create, PageActionScope.Global),
            buildAction(PageStandardAction.Edit, PageActionScope.Item),
            buildAction(PageStandardAction.Delete, PageActionScope.Item)
        ];
        const selected: PageItem[] = [{ actions: [PageStandardAction.Delete], id: 1 }];

        const visible = service.filterVisibleActions(actions, [PageStandardAction.Create], selected);

        expect(visible.map(action => action.key)).toEqual([PageStandardAction.Create, PageStandardAction.Delete]);
    });
});

function buildAction(key: string, scope: PageActionScope, handler?: (items?: PageItem[]) => void): PageAction {
    return new PageAction({ handler, key, scope, zone: PageActionZone.Left });
}

function buildContext(overrides?: Partial<PageActionsContext>): PageActionsContext {
    return {
        config: new PageConfig({
            baseUrl: '/items',
            formConfig: new PageFormConfig({
                buildSections: () => [new FormSection({ key: 'section1', rows: [] })],
                prefix: 'testPage.form'
            }),
            page: 'testPage'
        }),
        onDeleted: jest.fn(),
        onFormModalOpened: jest.fn(),
        onSaved: jest.fn(),
        selectedItems: () => [],
        ...overrides
    };
}
