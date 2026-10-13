export interface LockNoticeOptions {
    config: EditLockNoticeConfig;
    language: string;
    onAcquire: () => void;
    onRelease: (name: string) => void;
    onTakeOver: () => void;
    translate: (key: string) => string;
}

export interface LockTime {
    date: string;
    isToday: boolean;
    time: string;
}

export class EditLockNoticeConfig {
    prefix: string;

    onEdit?: (claim: () => void) => void;
    onSaveCopy?: () => void;

    constructor({
        onEdit,
        onSaveCopy,
        prefix = 'angular-components.edit-lock-notice'
    }: EditLockNoticeConfigParameters = {}) {
        this.onEdit = onEdit;
        this.onSaveCopy = onSaveCopy;
        this.prefix = prefix;
    }
}

export interface EditLockNoticeConfigParameters {
    onEdit?: (claim: () => void) => void;
    onSaveCopy?: () => void;
    prefix?: string;
}
