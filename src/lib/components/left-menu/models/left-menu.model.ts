import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { NotificationsConfig } from '../../notifications/models/notifications.model';

export class LeftMenuAction {
    isActive: boolean;
    isDisabled: boolean;
    key: string;
    label: string;
    subActions: LeftMenuAction[];
    tooltip: string;

    action?: () => void;
    icon?: IconDefinition;
    route?: string;

    constructor({
        action,
        icon,
        isActive = false,
        isDisabled = false,
        key,
        label = `${key}.label`,
        route,
        subActions = [],
        tooltip = `${key}.tooltip`
    }: LeftMenuActionParameters) {
        this.action = action;
        this.icon = icon;
        this.isActive = isActive;
        this.isDisabled = isDisabled;
        this.key = key;
        this.label = label;
        this.route = route;
        this.subActions = subActions;
        this.tooltip = tooltip;
    }
}

export class LeftMenuConfig {
    bottomActions: LeftMenuAction[];
    isExpanded: boolean;
    prefix: string;
    title: LeftMenuTitle;
    topActions: LeftMenuAction[];

    notifications?: NotificationsConfig;
    onExpandedChange?: (expanded: boolean) => void;
    userInfo?: LeftMenuUserInfo;

    constructor({
        prefix,
        title,
        topActions = [],
        bottomActions = [],
        isExpanded = true,
        notifications,
        onExpandedChange,
        userInfo
    }: LeftMenuConfigParameters) {
        this.onExpandedChange = onExpandedChange;
        this.bottomActions = bottomActions;
        this.isExpanded = isExpanded;
        this.notifications = notifications;
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
    name: string;
    surname: string;

    initials?: string;
    route?: string;

    constructor({ email = '', initials, name, route, surname = '' }: LeftMenuUserInfoParameters) {
        this.email = email;
        this.initials = initials;
        this.name = name;
        this.route = route;
        this.surname = surname;
    }
}

export interface LeftMenuActionParameters {
    key: string;

    action?: () => void;
    icon?: IconDefinition;
    isActive?: boolean;
    isDisabled?: boolean;
    label?: string;
    route?: string;
    subActions?: LeftMenuAction[];
    tooltip?: string;
}

export interface LeftMenuConfigParameters {
    prefix: string;
    title: LeftMenuTitle;

    bottomActions?: LeftMenuAction[];
    isExpanded?: boolean;
    notifications?: NotificationsConfig;
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
    route?: string;
    surname?: string;
}
