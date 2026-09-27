import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class LeftMenuAction {
    active: boolean;
    disabled: boolean;
    key: string;
    label: string;
    subActions: LeftMenuAction[];
    tooltip: string;

    action?: () => void;
    icon?: IconDefinition;
    route?: string;

    constructor({
        key,
        action,
        active = false,
        disabled = false,
        icon,
        label = `${key}.label`,
        route,
        subActions = [],
        tooltip = `${key}.tooltip`
    }: LeftMenuActionParameters) {
        this.action = action;
        this.active = active;
        this.disabled = disabled;
        this.icon = icon;
        this.label = label;
        this.route = route;
        this.subActions = subActions;
        this.key = key;
        this.tooltip = tooltip;
    }
}

export class LeftMenuConfig {
    bottomActions: LeftMenuAction[];
    expanded: boolean;
    prefix: string;
    title: LeftMenuTitle;
    topActions: LeftMenuAction[];

    onExpandedChange?: (expanded: boolean) => void;
    userInfo?: LeftMenuUserInfo;

    constructor({
        prefix,
        title,
        topActions = [],
        bottomActions = [],
        expanded = true,
        onExpandedChange,
        userInfo
    }: LeftMenuConfigParameters) {
        this.onExpandedChange = onExpandedChange;
        this.bottomActions = bottomActions;
        this.expanded = expanded;
        this.prefix = prefix;
        this.title = title;
        this.topActions = topActions;
        this.userInfo = userInfo;
    }
}

export class LeftMenuTitle {
    icon: string;
    title: string;

    constructor({ icon = '', title = 'title' }: LeftMenuTitleParameters) {
        this.icon = icon;
        this.title = title;
    }
}

export class LeftMenuUserInfo {
    email: string;
    initials: string;
    name: string;
    surname: string;

    constructor({ email = '', initials = '', name, surname = '' }: LeftMenuUserInfoParameters) {
        this.email = email;
        this.initials = initials || this.getInitials(name, surname);
        this.name = name;
        this.surname = surname;
    }

    private getInitials(name: string, surname: string): string {
        const nameInitial = name ? name.charAt(0).toUpperCase() : '';
        const surnameInitial = surname ? surname.charAt(0).toUpperCase() : '';

        return nameInitial + surnameInitial;
    }
}

export interface LeftMenuActionParameters {
    key: string;

    action?: () => void;
    active?: boolean;
    disabled?: boolean;
    icon?: IconDefinition;
    label?: string;
    route?: string;
    subActions?: LeftMenuAction[];
    tooltip?: string;
}

export interface LeftMenuConfigParameters {
    prefix: string;
    title: LeftMenuTitle;

    bottomActions?: LeftMenuAction[];
    expanded?: boolean;
    /** Run when the user expands or collapses the menu. */
    onExpandedChange?: (expanded: boolean) => void;
    topActions?: LeftMenuAction[];
    userInfo?: LeftMenuUserInfo;
}

export interface LeftMenuTitleParameters {
    icon?: string;
    title?: string;
}

export interface LeftMenuUserInfoParameters {
    name: string;

    email?: string;
    initials?: string;
    surname?: string;
}
