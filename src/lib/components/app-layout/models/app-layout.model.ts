import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { FooterConfig } from '../../footer/models/footer.model';
import { LeftMenuAction, LeftMenuTitle, LeftMenuUserInfo } from '../../left-menu/models/left-menu.model';

export class AppLayoutBottomAction extends LeftMenuAction {
    constructor({ action, icon, key }: AppLayoutBottomActionParameters) {
        super({ action, key, icon });
    }
}

export class AppLayoutBreadcrumbItem extends BreadcrumbItem {
    constructor({ icon, id, label }: AppLayoutBreadcrumbItemParameters) {
        super({ icon, id, label });
    }
}

export class AppLayoutConfig {
    bottomActions: AppLayoutBottomAction[];
    breadcrumb: AppLayoutBreadcrumbItem[];
    footerConfig: FooterConfig;
    prefix: string;
    title: LeftMenuTitle;
    topActions: AppLayoutTopAction[];
    useBodyPadding: boolean;

    onBreadcrumbClick?: (id: number) => void;
    onLayoutInitialized?: () => void;
    onMenuActionClick?: (key: string) => void;
    onRouteActivated?: (key: string) => void;
    userInfo?: LeftMenuUserInfo;

    constructor({
        bottomActions = [],
        breadcrumb = [],
        iconSrc,
        onBreadcrumbClick,
        onLayoutInitialized,
        onMenuActionClick,
        onRouteActivated,
        orgName = 'Beyonda Labs',
        prefix = 'app-layout',
        privacyUrl,
        productName,
        termsUrl,
        title,
        topActions = [],
        useBodyPadding = true,
        userInfo
    }: AppLayoutConfigParameters) {
        this.bottomActions = bottomActions;
        this.breadcrumb = breadcrumb;
        this.onBreadcrumbClick = onBreadcrumbClick;
        this.onLayoutInitialized = onLayoutInitialized;
        this.onMenuActionClick = onMenuActionClick;
        this.onRouteActivated = onRouteActivated;
        this.prefix = prefix;
        this.title = title;
        this.topActions = topActions;
        this.useBodyPadding = useBodyPadding;
        this.userInfo = userInfo;
        this.footerConfig = new FooterConfig({
            iconSrc,
            orgName,
            privacyUrl,
            productName,
            termsUrl
        });
    }
}

export class AppLayoutTopAction extends LeftMenuAction {
    constructor({
        action,
        active = false,
        disabled = false,
        icon,
        key,
        route,
        subActions = []
    }: AppLayoutTopActionParameters) {
        super({ action, active, disabled, icon, key, route, subActions });
    }
}

export interface AppLayoutBottomActionParameters {
    icon: IconDefinition;
    key: string;

    action?: () => void;
}

export interface AppLayoutBreadcrumbItemParameters {
    id: number;
    label: string;

    icon?: IconDefinition;
}

export interface AppLayoutConfigParameters {
    iconSrc: string;
    productName: string;
    title: LeftMenuTitle;

    bottomActions?: AppLayoutBottomAction[];
    breadcrumb?: AppLayoutBreadcrumbItem[];
    onBreadcrumbClick?: (id: number) => void;
    onLayoutInitialized?: () => void;
    onMenuActionClick?: (key: string) => void;
    onRouteActivated?: (key: string) => void;
    orgName?: string;
    prefix?: string;
    privacyUrl?: string;
    termsUrl?: string;
    topActions?: AppLayoutTopAction[];
    useBodyPadding?: boolean;
    userInfo?: LeftMenuUserInfo;
}

export interface AppLayoutTopActionParameters {
    icon: IconDefinition;
    key: string;

    action?: () => void;
    active?: boolean;
    disabled?: boolean;
    route?: string;
    subActions?: AppLayoutTopAction[];
}
