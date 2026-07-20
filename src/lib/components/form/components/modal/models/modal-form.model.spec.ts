import { FormControl, FormGroup } from '@angular/forms';

import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormButtonType, FormRow, FormSection } from '../../../models/form.model';
import { ModalFormConfig, ModalFormSize } from './modal-form.model';

interface TestValue {
    section1: {
        text1: string;
    };
}

describe('ModalFormConfig', () => {
    it('should build cancel and submit buttons from the i18n prefix', () => {
        const config = buildConfig();

        expect(config.buttons).toHaveLength(2);
        expect(config.buttons[0].label).toBe('test.modal-form.buttons.cancel');
        expect(config.buttons[0].type).toBe(FormButtonType.Cancel);
        expect(config.buttons[1].label).toBe('test.modal-form.buttons.submit');
        expect(config.buttons[1].type).toBe(FormButtonType.Submit);
    });

    it('should build the title key from the i18n prefix', () => {
        const config = buildConfig();

        expect(config.getTitle()).toBe('test.modal-form.title');
    });

    it('should keep the provided title and button label overrides', () => {
        const config = new ModalFormConfig({
            cancelLabel: 'custom.cancel',
            i18nPrefix: 'test.modal-form',
            sections: [],
            submitLabel: 'custom.submit',
            title: 'custom.title'
        });

        expect(config.getTitle()).toBe('custom.title');
        expect(config.buttons[0].label).toBe('custom.cancel');
        expect(config.buttons[1].label).toBe('custom.submit');
    });

    it('should default the size to large', () => {
        const config = buildConfig();

        expect(config.size).toBe(ModalFormSize.Large);
    });

    it('should keep the provided size', () => {
        const config = buildConfig({ size: ModalFormSize.ExtraLarge });

        expect(config.size).toBe(ModalFormSize.ExtraLarge);
    });

    it('should request a guarded close when the cancel button is clicked', () => {
        const closeRequestHandler = jest.fn();
        const config = buildConfig();

        config.closeRequestHandler = closeRequestHandler;
        config.buttons[0].action?.();

        expect(closeRequestHandler).toHaveBeenCalled();
    });

    it('should close immediately through the close handler', () => {
        const closeHandler = jest.fn();
        const config = buildConfig();

        config.closeHandler = closeHandler;
        config.close();

        expect(closeHandler).toHaveBeenCalled();
    });

    it('should report dirty state from the form group', () => {
        const config = buildConfig();

        expect(config.isDirty()).toBe(false);

        const formGroup = buildFormGroup(config);
        formGroup.markAsDirty();

        expect(config.isDirty()).toBe(true);
    });

    it('should apply the initial value once the form group is added', () => {
        const initialValue: TestValue = { section1: { text1: 'initial' } };
        const config = buildConfig({ initialValue });
        const formGroup = buildFormGroup(config);

        config.onFormGroupAdded?.(formGroup, config);

        expect(config.getInitialValue()).toEqual(initialValue);
        expect(config.getValue()).toEqual(initialValue);
    });

    it('should call the consumer onFormGroupAdded with the modal form config', () => {
        const onFormGroupAdded = jest.fn();
        const config = buildConfig({ onFormGroupAdded });
        const formGroup = buildFormGroup(config);

        config.onFormGroupAdded?.(formGroup, config);

        expect(onFormGroupAdded).toHaveBeenCalledWith(formGroup, config);
    });

    it('should call the consumer onSubmit with the modal form config', () => {
        const onSubmit = jest.fn();
        const config = buildConfig({ onSubmit });
        const currentValue: TestValue = { section1: { text1: 'submitted' } };

        config.onSubmit?.(currentValue, config);

        expect(onSubmit).toHaveBeenCalledWith(currentValue, config);
    });

    it('should call the consumer onValueChange with the modal form config', () => {
        const onValueChange = jest.fn();
        const config = buildConfig({ onValueChange });
        const currentValue: TestValue = { section1: { text1: 'changed' } };

        config.onValueChange?.(currentValue, config);

        expect(onValueChange).toHaveBeenCalledWith(currentValue, config);
    });

    it('should not bind onValueChange when the consumer does not provide one', () => {
        const config = buildConfig();

        expect(config.onValueChange).toBeUndefined();
    });
});

function buildConfig(parameters?: {
    initialValue?: TestValue;
    onFormGroupAdded?: (formGroup: FormGroup, form: ModalFormConfig<TestValue>) => void;
    onSubmit?: (currentValue: TestValue, form: ModalFormConfig<TestValue>) => void;
    onValueChange?: (currentValue: TestValue, form: ModalFormConfig<TestValue>) => void;
    size?: ModalFormSize;
}): ModalFormConfig<TestValue> {
    return new ModalFormConfig<TestValue>({
        i18nPrefix: 'test.modal-form',
        initialValue: parameters?.initialValue,
        onFormGroupAdded: parameters?.onFormGroupAdded,
        onSubmit: parameters?.onSubmit,
        onValueChange: parameters?.onValueChange,
        sections: [
            new FormSection({
                key: 'section1',
                rows: [new FormRow({ fields: [new FormTextField({ key: 'text1' })] })]
            })
        ],
        size: parameters?.size
    });
}

function buildFormGroup(config: ModalFormConfig<TestValue>): FormGroup {
    const formGroup = new FormGroup({
        section1: new FormGroup({
            text1: new FormControl('')
        })
    });

    config.formGroup = formGroup;

    return formGroup;
}
