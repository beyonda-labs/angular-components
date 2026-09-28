export class UnsavedChangesConfig {
    cancelLabel: string;
    confirmLabel: string;
    message: string;
    title: string;

    constructor({
        cancelLabel = 'angular-components.modal.unsaved-changes.stay',
        confirmLabel = 'angular-components.modal.unsaved-changes.leave',
        message = 'angular-components.modal.unsaved-changes.message',
        title = 'angular-components.modal.unsaved-changes.title'
    }: UnsavedChangesConfigParameters = {}) {
        this.cancelLabel = cancelLabel;
        this.confirmLabel = confirmLabel;
        this.message = message;
        this.title = title;
    }
}

export interface UnsavedChangesConfigParameters {
    cancelLabel?: string;
    confirmLabel?: string;
    message?: string;
    title?: string;
}
