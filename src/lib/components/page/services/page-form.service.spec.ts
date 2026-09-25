import { TestBed } from '@angular/core/testing';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { ModalFormService } from '../../form/components/modal/services/modal-form.service';
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
    let service: PageFormService;

    const open = jest.fn();

    beforeEach(() => {
        open.mockReset();
        open.mockReturnValue({});

        TestBed.configureTestingModule({
            providers: [
                PageFormService,
                {
                    provide: ModalFormService,
                    useValue: { open }
                }
            ]
        });

        service = TestBed.inject(PageFormService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should open a create modal form initialized from the page form config', () => {
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

    it('should open an edit modal form with the item mapped through toFormValue', () => {
        const item: PageItem = { id: 7 };

        service.open(buildPageForm(), item, 'testPage', jest.fn());

        const config = getOpenedConfig();

        expect(config.title).toBe('testPage.form.edit.title');
        expect(config.initialValue).toEqual({ section1: { text1: '7' } });
    });

    it('should allow a create-mode initial value through toFormValue without an item', () => {
        const pageForm = buildPageForm();

        pageForm.toFormValue = item => ({ section1: { text1: item ? String(item.id) : 'default' } });

        service.open(pageForm, undefined, 'testPage', jest.fn());

        expect(getOpenedConfig().initialValue).toEqual({ section1: { text1: 'default' } });
    });

    it('should map the submitted value through toItem and delegate saving', () => {
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

    it('should call the edit callback when submitting with an item', () => {
        const onEdit = jest.fn();
        const item: PageItem = { id: 7 };

        service.open(buildPageForm({ onEdit }), item, 'testPage', jest.fn());

        const config = getOpenedConfig();
        const handle = {} as FormHandle<TestFormValue>;
        const currentValue: TestFormValue = { section1: { text1: 'value' } };

        config.onSubmit?.(currentValue, handle);

        expect(onEdit).toHaveBeenCalledWith(currentValue, handle);
    });

    function getOpenedConfig(): ModalFormConfig<TestFormValue> {
        return open.mock.calls[0][0] as ModalFormConfig<TestFormValue>;
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
