import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class HeaderConfig {
    leftActions: HeaderAction[] = [];
    rightActions: HeaderAction[] = [];
    prefix: string;
    title: string;

    constructor({ prefix, title = '', leftActions = [], rightActions = [] }: HeaderConfigParameters) {
        this.leftActions = leftActions;
        this.prefix = prefix;
        this.rightActions = rightActions;
        this.title = title;
    }
}

export interface HeaderConfigParameters {
    prefix: string;

    leftActions?: HeaderAction[];
    rightActions?: HeaderAction[];
    title?: string;
}

export class HeaderAction {
    key: string;
    label: string;
    tooltip: string;
    type: HeaderActionType;

    action?: () => void;
    icon?: IconDefinition;

    constructor({
        action,
        icon,
        key,
        label = `${key}.label`,
        tooltip = `${key}.tooltip`,
        type
    }: HeaderActionParameters) {
        this.action = action;
        this.icon = icon;
        this.key = key;
        this.label = label;
        this.tooltip = tooltip;
        this.type = type;
    }
}

export interface HeaderActionParameters {
    key: string;
    type: HeaderActionType;

    action?: () => void;
    icon?: IconDefinition;
    label?: string;
    tooltip?: string;
}

export enum HeaderActionType {
    PrimaryButton = 'primary-button',
    SecondaryButton = 'secondary-button',
    Text = 'text'
}
