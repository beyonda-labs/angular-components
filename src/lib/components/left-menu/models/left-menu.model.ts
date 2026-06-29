import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class LeftMenuConfig {
    bottomActions: LeftMenuAction[];
    expanded: boolean;
    prefix: string;
    title: LeftMenuTitle;
    topActions: LeftMenuAction[];
    userInfo?: LeftMenuUserInfo;

    constructor({
        prefix,
        title,
        topActions = [],
        bottomActions = [],
        expanded = true,
        userInfo
    }: LeftMenuConfigParameters) {
        this.bottomActions = bottomActions;
        this.expanded = expanded;
        this.prefix = prefix;
        this.title = title;
        this.topActions = topActions;
        this.userInfo = userInfo;
    }
}

export interface LeftMenuConfigParameters {
    prefix: string;
    title: LeftMenuTitle;

    bottomActions?: LeftMenuAction[];
    expanded?: boolean;
    topActions?: LeftMenuAction[];
    userInfo?: LeftMenuUserInfo;
}

export class LeftMenuTitle {
    icon: string;
    styles: string;
    title: string;

    constructor({ icon = '', styles = '', title = 'title' }: LeftMenuTitleParameters) {
        this.icon = icon;
        this.styles = styles;
        this.title = title;
    }
}

export interface LeftMenuTitleParameters {
    icon?: string;

    styles?: string;
    title?: string;
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

export interface LeftMenuUserInfoParameters {
    name: string;

    email?: string;
    initials?: string;
    surname?: string;
}

export class LeftMenuAction {
    active: boolean;
    disabled: boolean;
    label: string;
    subActions: LeftMenuAction[];
    key: string;
    route?: string;
    tooltip: string;

    action?: () => void;
    icon?: IconDefinition;

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
