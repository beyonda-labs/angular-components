import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormHandle, FormRow, FormSection } from '../../form/models/form.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageFormService } from './page-form.service';

interface TestFormValue {
    section1: {
        text1: string;
    };
}

describe('PageFormService', () => {
    let modalForm: FakeModalFormService;
    let service: PageFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        modalForm = TestBed.inject(FakeModalFormService);
        service = TestBed.inject(PageFormService);
    });

    it('opens a create modal form built from the page form config', () => {
        service.open(buildPageForm(), undefined, 'testPage', jest.fn());

        const config = getOpenedConfig();

        expect(config).toBeInstanceOf(ModalFormConfig);
        expect(config.title).toBe('testPage.form.create.title');
        expect(config.buttons[0].label).toBe('angular-components.page.form.cancel');
        expect(config.buttons[1].label).toBe('angular-components.page.form.submit');
        expect(config.prefix).toBe('testPage.form');
        expect(config.sections).toHaveLength(1);
        expect(config.initialValue).toBeUndefined();
    });

    it('opens an edit modal form with the item mapped through toFormValue', () => {
        const item: PageItem = { id: 7 };

        service.open(buildPageForm(), item, 'testPage', jest.fn());

        const config = getOpenedConfig();

        expect(config.title).toBe('testPage.form.edit.title');
        expect(config.initialValue).toEqual({ section1: { text1: '7' } });
    });

    it('takes a create-mode initial value from toFormValue without an item', () => {
        const pageForm = buildPageForm();

        pageForm.toFormValue = item => ({ section1: { text1: item ? String(item.id) : 'default' } });

        service.open(pageForm, undefined, 'testPage', jest.fn());

        expect(getOpenedConfig().initialValue).toEqual({ section1: { text1: 'default' } });
    });

    it('forwards every value change of the modal form with its handle', () => {
        const onValueChange = jest.fn();
        const pageForm = buildPageForm();
        const handle = {} as FormHandle<TestFormValue>;
        const value: TestFormValue = { section1: { text1: 'Ada' } };

        pageForm.onValueChange = onValueChange;
        service.open(pageForm, undefined, 'testPage', jest.fn());
        getOpenedConfig().onValueChange?.(value, handle);

        expect(onValueChange).toHaveBeenCalledWith(value, handle);
    });

    it('calls onCreate and saves the value mapped through toItem', () => {
        const onCreate = jest.fn();
        const onSave = jest.fn();

        service.open(buildPageForm({ onCreate }), undefined, 'testPage', onSave);

        const config = getOpenedConfig();
        const handle = {} as FormHandle<TestFormValue>;
        const currentValue: TestFormValue = { section1: { text1: 'value' } };

        config.onSubmit?.(currentValue, handle);

        expect(onCreate).toHaveBeenCalledWith(currentValue, handle);
        expect(onSave).toHaveBeenCalledWith({ mapped: currentValue }, handle);
    });

    it('calls onEdit when submitting with an item', () => {
        const onEdit = jest.fn();
        const item: PageItem = { id: 7 };

        service.open(buildPageForm({ onEdit }), item, 'testPage', jest.fn());

        const config = getOpenedConfig();
        const handle = {} as FormHandle<TestFormValue>;
        const currentValue: TestFormValue = { section1: { text1: 'value' } };

        config.onSubmit?.(currentValue, handle);

        expect(onEdit).toHaveBeenCalledWith(currentValue, handle);
    });

    it('asks with the confirmation of confirmSave before saving, and saves only once confirmed', () => {
        const modal = TestBed.inject(FakeModalService);
        const onSave = jest.fn();
        const pageForm = buildPageForm();
        const item: PageItem = { id: 7 };
        const confirmation = { message: 'testPage.modal.rename.message', title: 'testPage.modal.rename.title' };
        const currentValue: TestFormValue = { section1: { text1: 'renamed' } };

        pageForm.confirmSave = (value, original) =>
            value.section1.text1 !== String(original?.id) ? confirmation : null;
        service.open(pageForm, item, 'testPage', onSave);

        getOpenedConfig().onSubmit?.(currentValue, {} as FormHandle<TestFormValue>);
        expect(modal.confirmations()).toEqual([confirmation]);
        expect(onSave).not.toHaveBeenCalled();

        modal.setConfirmationAnswer(true);
        getOpenedConfig().onSubmit?.(currentValue, {} as FormHandle<TestFormValue>);
        expect(onSave).toHaveBeenCalledWith({ mapped: currentValue }, {});
    });

    it('saves without asking when confirmSave answers no confirmation', () => {
        const modal = TestBed.inject(FakeModalService);
        const onSave = jest.fn();
        const pageForm = buildPageForm();

        pageForm.confirmSave = () => of(null);
        service.open(pageForm, { id: 7 }, 'testPage', onSave);
        getOpenedConfig().onSubmit?.({ section1: { text1: '7' } }, {} as FormHandle<TestFormValue>);

        expect(modal.confirmations()).toEqual([]);
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('opens a form with its own request through the modal forms and reports the save once it answers', () => {
        const config = new ModalFormConfig<TestFormValue>({ prefix: 'testPage.status', sections: [] });
        const submit = jest.fn(() => of(null));
        const onSaved = jest.fn();
        const close = jest.fn();

        service.openWithRequest(config, submit, onSaved);
        getOpenedConfig().onSubmit?.({ section1: { text1: 'draft' } }, {
            close
        } as unknown as FormHandle<TestFormValue>);

        expect(getOpenedConfig().prefix).toBe('testPage.status');
        expect(submit).toHaveBeenCalledWith({ section1: { text1: 'draft' } });
        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledTimes(1);
    });

    function getOpenedConfig(): ModalFormConfig<TestFormValue> {
        return modalForm.forms()[0] as ModalFormConfig<TestFormValue>;
    }
});

function buildPageForm(callbacks?: {
    onCreate?: (value: TestFormValue, handle: FormHandle<TestFormValue>) => void;
    onEdit?: (value: TestFormValue, handle: FormHandle<TestFormValue>) => void;
}): PageFormConfig<TestFormValue> {
    return new PageFormConfig<TestFormValue>({
        buildSections: () => [
            new FormSection({
                key: 'section1',
                rows: [new FormRow({ fields: [new FormTextField({ key: 'text1' })] })]
            })
        ],
        onCreate: callbacks?.onCreate,
        onEdit: callbacks?.onEdit,
        prefix: 'testPage.form',
        toFormValue: item => (item ? { section1: { text1: String(item.id) } } : undefined),
        toItem: value => ({ mapped: value })
    });
}
