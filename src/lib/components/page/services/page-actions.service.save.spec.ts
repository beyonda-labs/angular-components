import { TestBed } from '@angular/core/testing';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { config as rxjsConfig, of, Subject, throwError } from 'rxjs';

import { FormHandle, FormSection } from '../../form/models/form.model';
import { pageStandardAction } from '../functions/page-standard-actions';
import { PageActionsContext, PageConfig } from '../models/page.model';
import { PageStandardAction } from '../models/page-action.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageActionsService } from './page-actions.service';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

const CREATED: PageItem = { id: 'a-1' };
const RECREATED: PageItem = { id: 'a-2' };
const REFUSED = new Error('refused');
const VALUE = { name: 'Logo' };

describe('PageActionsService — saving a row', () => {
    const afterCreate = jest.fn();
    const create = jest.fn();
    const edit = jest.fn();
    const openPageForm = jest.fn();
    const unhandled = jest.fn();
    let handle: FakeFormHandle;
    let previousHandler: typeof rxjsConfig.onUnhandledError;
    let service: PageActionsService;

    function buildContext(selectedItems: PageItem[] = []): PageActionsContext {
        return {
            config: new PageConfig({
                baseUrl: '/attachments',
                formConfig: new PageFormConfig({
                    afterCreate,
                    buildSections: () => [new FormSection({ key: 'file', rows: [] })],
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
            selectedItems: () => selectedItems
        };
    }

    function openForm(key: PageStandardAction, context: PageActionsContext): (value: unknown) => void {
        service.executeAction(pageStandardAction(key), context);
        const onSave = openPageForm.mock.calls[0][3] as (value: unknown, handle: FormHandle) => void;

        return value => onSave(value, handle);
    }

    async function unhandledErrors(): Promise<unknown[]> {
        await new Promise(resolve => {
            setTimeout(resolve);
        });

        return unhandled.mock.calls.map(([error]) => error);
    }

    beforeEach(() => {
        jest.resetAllMocks();
        handle = new FakeFormHandle();
        openPageForm.mockReturnValue({});
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PageFormService, useValue: { open: openPageForm } },
                { provide: PageHttpService, useValue: { create, edit } }
            ]
        });
        service = TestBed.inject(PageActionsService);
        previousHandler = rxjsConfig.onUnhandledError;
        rxjsConfig.onUnhandledError = unhandled;
    });

    afterEach(() => {
        rxjsConfig.onUnhandledError = previousHandler;
    });

    it('keeps the form open, reloads nothing and leaves no error unhandled when the create fails', async () => {
        create.mockReturnValue(throwError(() => REFUSED));
        const context = buildContext();

        openForm(PageStandardAction.Create, context)(VALUE);

        expect(await unhandledErrors()).toEqual([]);
        expect(afterCreate).not.toHaveBeenCalled();
        expect(handle.closes()).toBe(0);
        expect(context.onSaved).not.toHaveBeenCalled();
    });

    it('keeps the form open, reloads nothing and leaves no error unhandled when the edit fails', async () => {
        edit.mockReturnValue(throwError(() => REFUSED));
        const context = buildContext([{ id: 7 }]);

        openForm(PageStandardAction.Edit, context)(VALUE);

        expect(await unhandledErrors()).toEqual([]);
        expect(edit).toHaveBeenCalledWith('/attachments', 7, VALUE, 'testPage.toast.edit-success');
        expect(handle.closes()).toBe(0);
        expect(context.onSaved).not.toHaveBeenCalled();
    });

    it('closes the form and reloads the list only once the follow-up of the created row answers', () => {
        const uploaded = new Subject<void>();
        create.mockReturnValue(of(CREATED));
        afterCreate.mockReturnValue(uploaded);
        const context = buildContext();

        openForm(PageStandardAction.Create, context)(VALUE);

        expect(afterCreate).toHaveBeenCalledWith(CREATED);
        expect(handle.closes()).toBe(0);

        uploaded.next();

        expect(handle.closes()).toBe(1);
        expect(context.onSaved).toHaveBeenCalledTimes(1);
    });

    it('keeps the form open, reloads the list and leaves no error unhandled when the follow-up fails', async () => {
        create.mockReturnValue(of(CREATED));
        afterCreate.mockReturnValue(throwError(() => REFUSED));
        const context = buildContext();

        openForm(PageStandardAction.Create, context)(VALUE);

        expect(await unhandledErrors()).toEqual([]);
        expect(handle.closes()).toBe(0);
        expect(context.onSaved).toHaveBeenCalledTimes(1);
    });

    it('creates the row anew when the form is sent again after a failed follow-up, and closes once it answers', async () => {
        create.mockReturnValueOnce(of(CREATED)).mockReturnValueOnce(of(RECREATED));
        afterCreate.mockReturnValueOnce(throwError(() => REFUSED)).mockReturnValueOnce(of(null));
        const context = buildContext();
        const send = openForm(PageStandardAction.Create, context);

        send(VALUE);
        send(VALUE);

        expect(await unhandledErrors()).toEqual([]);
        expect(create.mock.calls).toEqual([
            ['/attachments', VALUE, 'testPage.toast.create-success'],
            ['/attachments', VALUE, 'testPage.toast.create-success']
        ]);
        expect(afterCreate.mock.calls).toEqual([[CREATED], [RECREATED]]);
        expect(handle.closes()).toBe(1);
    });

    it('opens the create form for the category open in the page, and for none at the root', () => {
        const category = { id: 'cat-1', label: 'Clients' };

        service.executeAction(pageStandardAction(PageStandardAction.Create), {
            ...buildContext(),
            getCurrentCategory: () => category
        });
        service.executeAction(pageStandardAction(PageStandardAction.Create), {
            ...buildContext(),
            getCurrentCategory: () => null
        });

        expect(openPageForm.mock.calls.map(call => call[4])).toEqual([category, undefined]);
    });
});
