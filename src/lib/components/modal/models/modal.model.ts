export enum ModalType {
    Confirmation = 'confirmation',
    Error = 'error',
    Info = 'info',
    Warning = 'warning'
}

export interface NotificationModalConfig {
    message: string;
    title: string;

    closeLabel?: string;
    closeOnBackdrop?: boolean;
    messageParameters?: Record<string, unknown>;
}

export interface ConfirmationModalConfig {
    message: string;
    title: string;

    cancelLabel?: string;
    closeOnBackdrop?: boolean;
    confirmLabel?: string;
    messageParameters?: Record<string, unknown>;
}

export interface InternalModalConfig {
    message: string;
    primaryActionLabel: string;
    title: string;
    type: ModalType;

    closeOnBackdrop?: boolean;
    messageParameters?: Record<string, unknown>;
    secondaryActionLabel?: string;
}