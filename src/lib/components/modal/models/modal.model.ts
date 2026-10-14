export enum ModalType {
    Confirmation = 'confirmation',
    Error = 'error',
    Info = 'info',
    Warning = 'warning'
}

export interface ConfirmationModalConfig {
    message: string;
    title: string;

    cancelLabel?: string;
    canCloseOnBackdrop?: boolean;
    confirmLabel?: string;
    messageParameters?: Record<string, unknown>;
}

export interface InternalModalConfig {
    message: string;
    primaryActionLabel: string;
    title: string;
    type: ModalType;

    canCloseOnBackdrop?: boolean;
    messageParameters?: Record<string, unknown>;
    secondaryActionLabel?: string;
}

export interface NotificationModalConfig {
    message: string;
    title: string;

    canCloseOnBackdrop?: boolean;
    closeLabel?: string;
    messageParameters?: Record<string, unknown>;
}
