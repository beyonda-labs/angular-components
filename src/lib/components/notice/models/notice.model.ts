import { IconDefinition } from '@fortawesome/angular-fontawesome';

export enum NoticeActionType {
    Primary = 'primary',
    Secondary = 'secondary'
}

export enum NoticeVariant {
    Danger = 'danger',
    Info = 'info',
    Warning = 'warning'
}

export class NoticeAction {
    action: () => void;
    key: string;
    label: string;
    type: NoticeActionType;

    constructor({ action, key, label, type = NoticeActionType.Secondary }: NoticeActionParameters) {
        this.action = action;
        this.key = key;
        this.label = label;
        this.type = type;
    }
}

export class NoticeConfig {
    actions: NoticeAction[];
    message: string;
    variant: NoticeVariant;

    icon?: IconDefinition;
    messageParameters?: Record<string, unknown>;

    constructor({
        actions = [],
        icon,
        message,
        messageParameters,
        variant = NoticeVariant.Info
    }: NoticeConfigParameters) {
        this.actions = actions;
        this.icon = icon;
        this.message = message;
        this.messageParameters = messageParameters;
        this.variant = variant;
    }
}

export interface NoticeActionParameters {
    action: () => void;
    key: string;
    label: string;

    type?: NoticeActionType;
}

export interface NoticeConfigParameters {
    message: string;

    actions?: NoticeAction[];
    icon?: IconDefinition;
    messageParameters?: Record<string, unknown>;
    variant?: NoticeVariant;
}
