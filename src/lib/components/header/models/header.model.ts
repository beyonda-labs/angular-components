import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class HeaderConfig {
    leftActions: HeaderAction[] = [];
    menuActions: HeaderAction[] = [];
    rightActions: HeaderAction[] = [];
    prefix: string;
    title: string;
    variant: HeaderVariant;

    backAction?: HeaderAction;
    badge?: HeaderBadge;

    constructor({
        backAction,
        badge,
        prefix,
        title = '',
        leftActions = [],
        menuActions = [],
        rightActions = [],
        variant = HeaderVariant.Page
    }: HeaderConfigParameters) {
        this.backAction = backAction;
        this.badge = badge;
        this.leftActions = leftActions;
        this.menuActions = menuActions;
        this.prefix = prefix;
        this.rightActions = rightActions;
        this.title = title;
        this.variant = variant;
    }
}

export interface HeaderConfigParameters {
    prefix: string;

    backAction?: HeaderAction;
    badge?: HeaderBadge;
    leftActions?: HeaderAction[];
    menuActions?: HeaderAction[];
    rightActions?: HeaderAction[];
    title?: string;
    variant?: HeaderVariant;
}

export class HeaderAction {
    disabled: boolean;
    key: string;
    label: string;
    tooltip: string;
    type: HeaderActionType;

    action?: () => void;
    icon?: IconDefinition;
    subActions?: HeaderAction[];

    constructor({
        action,
        disabled = false,
        icon,
        key,
        label = `${key}.label`,
        subActions,
        tooltip = `${key}.tooltip`,
        type
    }: HeaderActionParameters) {
        this.action = action;
        this.disabled = disabled;
        this.icon = icon;
        this.key = key;
        this.label = label;
        this.subActions = subActions;
        this.tooltip = tooltip;
        this.type = type;
    }
}

export interface HeaderActionParameters {
    key: string;
    type: HeaderActionType;

    action?: () => void;
    disabled?: boolean;
    icon?: IconDefinition;
    label?: string;
    subActions?: HeaderAction[];
    tooltip?: string;
}

export enum HeaderActionType {
    PrimaryButton = 'primary-button',
    SecondaryButton = 'secondary-button',
    Text = 'text'
}

export enum HeaderVariant {
    Page = 'page',
    SubPage = 'subpage'
}

export interface HeaderBadge {
    text: string;

    cssClass?: string;
}
