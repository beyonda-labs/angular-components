import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
    faCalendarDays,
    faChartColumn,
    faFolderOpen,
    faGear,
    faHouse,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { LeftMenuTitle, LeftMenuUserInfo } from '../../../left-menu/models/left-menu.model';
import { AppLayoutComponent } from '../../app-layout.component';
import {
    AppLayoutBottomAction,
    AppLayoutBreadcrumbItem,
    AppLayoutConfig,
    AppLayoutTopAction
} from '../../models/app-layout.model';
import { AppLayoutService } from '../../services/app-layout.service';

const BRAND_ICON =
    // eslint-disable-next-line max-len
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22%3E%3Crect width=%2272%22 height=%2272%22 rx=%2222%22 fill=%22%23111111%22/%3E%3Ccircle cx=%2226%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22/%3E%3Ccircle cx=%2246%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22 opacity=%220.9%22/%3E%3C/svg%3E';

@Component({
    imports: [AppLayoutComponent, ButtonComponent, TranslateModule],
    selector: 'bey-app-layout-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './app-layout-style-guide.component.css'],
    templateUrl: './app-layout-style-guide.component.html'
})
export class AppLayoutStyleGuideComponent implements OnInit, OnDestroy {
    config: AppLayoutConfig;

    private readonly appLayoutService = inject(AppLayoutService);
    private readonly translateService = inject(TranslateService);

    private languageChangeSubscription?: Subscription;

    get dashboardButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.appLayoutService.emitMenuClick('dashboard'),
            label: 'angular-components-style-guide.appLayout.actions.dashboard.label',
            type: ButtonType.Secondary
        });
    }

    get documentsButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.appLayoutService.emitMenuClick('documents'),
            label: 'angular-components-style-guide.appLayout.actions.documents.label',
            type: ButtonType.Secondary
        });
    }

    get reportsButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.appLayoutService.emitMenuClick('reports'),
            label: 'angular-components-style-guide.appLayout.actions.reports.label',
            type: ButtonType.Secondary
        });
    }

    get settingsButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.appLayoutService.emitMenuClick('settings'),
            label: 'angular-components-style-guide.appLayout.actions.settings.label',
            type: ButtonType.Secondary
        });
    }

    get helpButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.appLayoutService.emitMenuClick('help'),
            label: 'angular-components-style-guide.appLayout.actions.help.label',
            type: ButtonType.Secondary
        });
    }

    constructor() {
        this.config = new AppLayoutConfig({
            iconSrc: BRAND_ICON,
            productName: 'angular-components-style-guide.appLayout.title',
            prefix: 'angular-components-style-guide.appLayout',
            title: new LeftMenuTitle({ icon: BRAND_ICON, title: 'angular-components-style-guide.appLayout.title' }),
            topActions: [
                new AppLayoutTopAction({ icon: faHouse, key: 'dashboard' }),
                new AppLayoutTopAction({ icon: faFolderOpen, key: 'documents' }),
                new AppLayoutTopAction({
                    icon: faChartColumn,
                    key: 'reports',
                    subActions: [
                        new AppLayoutTopAction({ icon: faCalendarDays, key: 'reports-monthly' }),
                        new AppLayoutTopAction({ icon: faChartColumn, key: 'reports-annual' })
                    ]
                })
            ],
            bottomActions: [
                new AppLayoutBottomAction({ icon: faGear, key: 'settings' }),
                new AppLayoutBottomAction({ icon: faQuestionCircle, key: 'help' })
            ],
            privacyUrl: '/privacy',
            termsUrl: '/terms',
            userInfo: new LeftMenuUserInfo({ email: 'demo@beyonda.dev', name: 'Demo', surname: 'User' }),
            onMenuActionClick: (page: string) => this.navigateTo(page),
            onLayoutInitialized: () => this.navigateTo('dashboard')
        });
    }

    ngOnInit(): void {
        this.languageChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.navigateTo('dashboard');
        });
    }

    ngOnDestroy(): void {
        this.languageChangeSubscription?.unsubscribe();
    }

    private navigateTo(page: string): void {
        const reports = this.translate('reports');
        const breadcrumbs: Record<string, AppLayoutBreadcrumbItem[]> = {
                dashboard: [new AppLayoutBreadcrumbItem({ id: 1, label: this.translate('dashboard') })],
                documents: [new AppLayoutBreadcrumbItem({ id: 2, label: this.translate('documents') })],
                reports: [new AppLayoutBreadcrumbItem({ id: 3, label: reports })],
                'reports-monthly': [
                    new AppLayoutBreadcrumbItem({ id: 3, label: reports }),
                    new AppLayoutBreadcrumbItem({ id: 4, label: this.translate('reports-monthly') })
                ],
                'reports-annual': [
                    new AppLayoutBreadcrumbItem({ id: 3, label: reports }),
                    new AppLayoutBreadcrumbItem({ id: 5, label: this.translate('reports-annual') })
                ],
                settings: [new AppLayoutBreadcrumbItem({ id: 6, label: this.translate('settings') })],
                help: [new AppLayoutBreadcrumbItem({ id: 7, label: this.translate('help') })]
            },
            items = breadcrumbs[page] ?? [];

        this.appLayoutService.setBreadcrumb(items);
        this.appLayoutService.activeMenuAction(page);
    }

    private translate(key: string): string {
        return this.translateService.instant(`angular-components-style-guide.appLayout.actions.${key}.label`);
    }
}
