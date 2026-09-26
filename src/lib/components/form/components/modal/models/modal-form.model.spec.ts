import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormButtonType, FormHandle, FormRow, FormSection } from '../../../models/form.model';
import { ModalFormConfig, ModalFormConfigParameters, ModalFormSize } from './modal-form.model';

describe('ModalFormConfig', () => {
    function buildConfig(overrides: Partial<ModalFormConfigParameters> = {}): ModalFormConfig {
        return new ModalFormConfig({
            prefix: 'demo.modal-form',
            sections: [
                new FormSection({
                    key: 'contact',
                    rows: [new FormRow({ fields: [new FormTextField({ key: 'name' })] })]
                })
            ],
            ...overrides
        });
    }

    it('builds the title, the cancel and the submit buttons from the prefix, and defaults to a large modal', () => {
        const config = buildConfig();

        expect(config.title).toBe('demo.modal-form.title');
        expect(config.buttons.map(button => [button.label, button.type])).toEqual([
            ['demo.modal-form.buttons.cancel', FormButtonType.Cancel],
            ['demo.modal-form.buttons.submit', FormButtonType.Submit]
        ]);
        expect(config.size).toBe(ModalFormSize.Large);
    });

    it('keeps the title, labels and size it is given', () => {
        const config = buildConfig({
            cancelLabel: 'custom.cancel',
            size: ModalFormSize.Small,
            submitLabel: 'custom.submit',
            title: 'custom.title'
        });

        expect(config.title).toBe('custom.title');
        expect(config.buttons.map(button => button.label)).toEqual(['custom.cancel', 'custom.submit']);
        expect(config.size).toBe(ModalFormSize.Small);
    });

    it('asks the host to close, with confirmation, from the cancel button', () => {
        const handle = { requestClose: jest.fn() } as unknown as FormHandle;

        buildConfig().buttons[0].action?.(handle);

        expect(handle.requestClose).toHaveBeenCalled();
    });

    it('passes the form callbacks through', () => {
        const onSubmit = jest.fn();
        const config = buildConfig({ initialValue: { contact: { name: 'Ada' } }, onSubmit });

        expect(config.initialValue).toEqual({ contact: { name: 'Ada' } });
        expect(config.onSubmit).toBe(onSubmit);
    });
});
