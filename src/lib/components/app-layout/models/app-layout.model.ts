import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { FooterConfig } from '../../footer/public-api';
import { LeftMenuAction, LeftMenuTitle, LeftMenuUserInfo } from '../../left-menu/models/left-menu.model';

export class AppLayoutConfig {
    bottomActions: AppLayoutBottomAction[];
    breadcrumb: AppLayoutBreadcrumbItem[];
    footerConfig: FooterConfig;
    prefix: string;
    title: LeftMenuTitle;
    topActions: AppLayoutTopAction[];

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

interface AppLayoutConfigParameters {
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
    userInfo?: LeftMenuUserInfo;
}

export class AppLayoutTopAction extends LeftMenuAction {
    constructor({ active = false, icon, key, route, subActions = [] }: AppLayoutTopActionParameters) {
        super({ active, icon, key, route, subActions });
    }
}

interface AppLayoutTopActionParameters {
    key: string;
    icon: IconDefinition;

    active?: boolean;
    route?: string;
    subActions?: AppLayoutTopAction[];
}

export class AppLayoutBottomAction extends LeftMenuAction {
    constructor({ icon, key }: AppLayoutBottomActionParameters) {
        super({ key, icon });
    }
}

interface AppLayoutBottomActionParameters {
    icon: IconDefinition;
    key: string;
}

export class AppLayoutBreadcrumbItem extends BreadcrumbItem {
    constructor({ icon, id, label }: AppLayoutBreadcrumbItemParameters) {
        super({ icon, id, label });
    }
}

interface AppLayoutBreadcrumbItemParameters {
    id: number;
    label: string;

    icon?: IconDefinition;
}
