import type { FormGroup } from '@angular/forms';

import { FormButton, FormButtonType, FormConfig, FormSection, FormStep } from '../../../models/form.model';

export const MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE = 'angular-components.form.modal.close-confirmation.message';
export const MODAL_FORM_CLOSE_CONFIRMATION_TITLE = 'angular-components.form.modal.close-confirmation.title';

export enum ModalFormSize {
    Small = 'modal-sm',
    Medium = '',
    Large = 'modal-lg',
    ExtraLarge = 'modal-xl'
}

export class ModalFormConfig<TValue = unknown> extends FormConfig<TValue> {
    size: ModalFormSize;

    /** Assigned internally by the modal form dialog: closes the modal immediately, without confirmation. */
    closeHandler?: () => void;
    /** Assigned internally by the modal form dialog: closes the modal asking for confirmation when dirty. */
    closeRequestHandler?: () => void;
    title?: string;

    constructor(parameters: ModalFormConfigParameters<TValue>) {
        super({
            i18nPrefix: parameters.i18nPrefix,
            sections: parameters.sections,
            steps: parameters.steps
        });

        const { cancelLabel, initialValue, onFormGroupAdded, onSubmit, onValueChange, size, submitLabel, title } =
            parameters;

        this.size = size ?? ModalFormSize.Large;
        this.title = title;

        this.buttons = [
            new FormButton({
                action: () => this.requestClose(),
                label: cancelLabel ?? `${this.i18nPrefix}.buttons.cancel`,
                type: FormButtonType.Cancel
            }),
            new FormButton({
                label: submitLabel ?? `${this.i18nPrefix}.buttons.submit`,
                type: FormButtonType.Submit
            })
        ];

        this.initialValue = initialValue;

        this.onFormGroupAdded = formGroup => {
            onFormGroupAdded?.(formGroup, this);

            if (initialValue !== undefined) {
                this.setInitialValue(initialValue);
            }
        };

        if (onSubmit) {
            this.onSubmit = currentValue => onSubmit(currentValue, this);
        }

        if (onValueChange) {
            this.onValueChange = currentValue => onValueChange(currentValue, this);
        }
    }

    close(): void {
        this.closeHandler?.();
    }

    getTitle(): string {
        return this.title ?? `${this.i18nPrefix}.title`;
    }

    isDirty(): boolean {
        return this.formGroup?.dirty === true;
    }

    requestClose(): void {
        this.closeRequestHandler?.();
    }
}

export interface ModalFormConfigParameters<TValue> {
    i18nPrefix: string;
    sections: FormSection[];

    /** Cancel button label key; defaults to `{i18nPrefix}.buttons.cancel`. */
    cancelLabel?: string;
    initialValue?: TValue;
    onFormGroupAdded?: (formGroup: FormGroup, form: ModalFormConfig<TValue>) => void;
    onSubmit?: (currentValue: TValue, form: ModalFormConfig<TValue>) => void;
    onValueChange?: (currentValue: TValue, form: ModalFormConfig<TValue>) => void;
    size?: ModalFormSize;
    steps?: FormStep[];
    /** Submit button label key; defaults to `{i18nPrefix}.buttons.submit`. */
    submitLabel?: string;
    /** Modal title key; defaults to `{i18nPrefix}.title`. */
    title?: string;
}
