import {
    FormButton,
    FormButtonLayout,
    FormButtonType,
    FormConfig,
    FormFooter,
    FormHandle,
    FormSection,
    FormStep
} from '../../../models/form.model';

export const MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE = 'angular-components.form.modal.close-confirmation.message';
export const MODAL_FORM_CLOSE_CONFIRMATION_TITLE = 'angular-components.form.modal.close-confirmation.title';

export enum ModalFormSize {
    ExtraLarge = 'modal-xl',
    Large = 'modal-lg',
    Medium = '',
    Small = 'modal-sm'
}

export class ModalFormConfig<TValue = unknown> extends FormConfig<TValue> {
    size: ModalFormSize;
    title: string;

    cancelLabel?: string;
    submitLabel?: string;

    constructor({
        cancelLabel,
        prefix,
        size = ModalFormSize.Large,
        submitLabel,
        title = `${prefix}.title`,
        ...form
    }: ModalFormConfigParameters<TValue>) {
        super({
            ...form,
            buttons: [
                new FormButton({
                    action: handle => handle.requestClose(),
                    label: cancelLabel ?? `${prefix}.buttons.cancel`,
                    type: FormButtonType.Cancel
                }),
                new FormButton({ label: submitLabel ?? `${prefix}.buttons.submit`, type: FormButtonType.Submit })
            ],
            prefix
        });

        this.cancelLabel = cancelLabel;
        this.size = size;
        this.submitLabel = submitLabel;
        this.title = title;
    }
}

export interface ModalFormConfigParameters<TValue = unknown> {
    prefix: string;
    sections: FormSection[];

    allowSubmitWithoutChanges?: boolean;
    buttonLayout?: FormButtonLayout;
    cancelLabel?: string;
    footer?: FormFooter;
    initialValue?: TValue;
    onReady?: (handle: FormHandle<TValue>) => void;
    onStepChange?: (key: string) => void;
    onSubmit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;
    size?: ModalFormSize;
    steps?: FormStep[];
    submitLabel?: string;
    title?: string;
}
