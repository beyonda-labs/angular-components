import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormFieldPatternValidator } from '../../form/models/form-field-validator.model';
import { PageConfig, PageConfigParameters } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageDuplicationConfig, PageLifecycleFormValue, PageStatusConfig } from '../models/page-lifecycle.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageLifecycleActionsService } from './page-lifecycle-actions.service';

describe('PageLifecycleActionsService', () => {
    const changeStatus = jest.fn();
    const duplicate = jest.fn();
    const emptyTrash = jest.fn();
    const openWithRequest = jest.fn();
    const onSaved = jest.fn();
    let service: PageLifecycleActionsService;

    function buildConfig(overrides: Partial<PageConfigParameters> = {}): PageConfig {
        return new PageConfig({
            baseUrl: '/products',
            prefix: 'shop.products',
            statusConfig: new PageStatusConfig({ transitions: { draft: ['published'], published: [] } }),
            ...overrides
        });
    }

    function openedForm(): ModalFormConfig<PageLifecycleFormValue> {
        return openWithRequest.mock.calls[0][0] as ModalFormConfig<PageLifecycleFormValue>;
    }

    function submit(value: PageLifecycleFormValue): void {
        (openWithRequest.mock.calls[0][1] as (value: PageLifecycleFormValue) => unknown)(value);
    }

    beforeEach(() => {
        jest.clearAllMocks();
        changeStatus.mockReturnValue(of({}));
        duplicate.mockReturnValue(of({}));
        emptyTrash.mockReturnValue(of(undefined));

        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({
                    translations: { en: { shop: { products: { duplicate: { 'copy-suffix': '(copy)' } } } } }
                }),
                { provide: PageFormService, useValue: { openWithRequest } },
                { provide: PageHttpService, useValue: { changeStatus, duplicate, emptyTrash } }
            ]
        });

        TestBed.inject(TranslateService).use('en');
        service = TestBed.inject(PageLifecycleActionsService);
    });

    describe('duplicate', () => {
        it('proposes the name of the row with the copy suffix and sends the name the user keeps', () => {
            service.duplicate(buildConfig(), { id: 'oats', name: 'Oats' } as never, onSaved);

            expect(openedForm().initialValue).toEqual({ main: { name: 'Oats (copy)' } });

            submit({ main: { name: 'Oats copy' } });

            expect(duplicate).toHaveBeenCalledWith(
                '/products',
                'oats',
                { name: 'Oats copy' },
                'shop.products.toast.duplicate-success'
            );
            expect(openWithRequest.mock.calls[0][2]).toBe(onSaved);
        });

        it('reads and sends the name field the page configures', () => {
            service.duplicate(
                buildConfig({ duplicationConfig: new PageDuplicationConfig({ nameField: 'title' }) }),
                { id: 'oats', title: 'Oats' } as never,
                onSaved
            );

            expect(openedForm().initialValue).toEqual({ main: { title: 'Oats (copy)' } });
        });

        it('joins the copy suffix with the configured separator and checks the name with its validators', () => {
            const validator = new FormFieldPatternValidator(/^[a-z_()]+$/u);

            service.duplicate(
                buildConfig({
                    duplicationConfig: new PageDuplicationConfig({ copySeparator: '_', nameValidators: [validator] })
                }),
                { id: 'client', name: 'client' } as never,
                onSaved
            );

            const [field] = openedForm().sections[0].rows[0].fields;

            expect(openedForm().initialValue).toEqual({ main: { name: 'client_(copy)' } });
            expect(field.validators).toEqual([validator]);
        });

        it('does nothing on a page without a backend', () => {
            service.duplicate(buildConfig({ baseUrl: undefined }), { id: 'oats' }, onSaved);

            expect(openWithRequest).not.toHaveBeenCalled();
        });
    });

    describe('emptyTrash', () => {
        function buildAction(overrides: Partial<ConstructorParameters<typeof PageAction>[0]> = {}): PageAction {
            return new PageAction({
                key: PageStandardAction.EmptyTrash,
                scope: PageActionScope.Global,
                zone: PageActionZone.Right,
                ...overrides
            });
        }

        it('asks first, then empties the trash with its success toast and reloads', () => {
            const modal = TestBed.inject(FakeModalService);
            modal.setConfirmationAnswer(true);

            service.emptyTrash(buildConfig(), buildAction(), onSaved);

            expect(modal.confirmations()).toEqual([
                { message: 'shop.products.modal.empty-trash.message', title: 'shop.products.modal.empty-trash.title' }
            ]);
            expect(emptyTrash).toHaveBeenCalledWith('/products', 'shop.products.toast.empty-trash-success');
            expect(onSaved).toHaveBeenCalled();
        });

        it('keeps the trash when the user does not confirm', () => {
            service.emptyTrash(buildConfig(), buildAction(), onSaved);

            expect(emptyTrash).not.toHaveBeenCalled();
            expect(onSaved).not.toHaveBeenCalled();
        });

        it('asks with the confirmation the action builds from the default one', () => {
            const modal = TestBed.inject(FakeModalService);

            service.emptyTrash(
                buildConfig(),
                buildAction({ confirmation: (_items, confirmation) => ({ ...confirmation, title: 'custom' }) }),
                onSaved
            );

            expect(modal.confirmations()[0]?.title).toBe('custom');
        });
    });

    describe('changeStatus', () => {
        it('offers the statuses the current one reaches and sends the one chosen', () => {
            service.changeStatus(buildConfig(), { id: 'oats', status: 'draft' } as never, onSaved);

            const [field] = openedForm().sections[0]?.rows[0]?.fields ?? [];

            expect((field as FormSelectField).options).toEqual([
                { label: 'shop.products.status.published', value: 'published' }
            ]);

            submit({ main: { status: 'published' } });

            expect(changeStatus).toHaveBeenCalledWith(
                '/products',
                'oats',
                { status: 'published' },
                'shop.products.toast.change-status-success'
            );
        });

        it('offers nothing for a status the transitions do not list', () => {
            service.changeStatus(buildConfig(), { id: 'oats', status: 'lost' } as never, onSaved);

            const [field] = openedForm().sections[0]?.rows[0]?.fields ?? [];

            expect((field as FormSelectField).options).toEqual([]);
        });

        it('does nothing on a page without a status config', () => {
            service.changeStatus(buildConfig({ statusConfig: undefined }), { id: 'oats' }, onSaved);

            expect(openWithRequest).not.toHaveBeenCalled();
        });
    });
});
