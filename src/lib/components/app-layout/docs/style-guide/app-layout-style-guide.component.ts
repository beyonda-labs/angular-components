import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    faCalendarDays,
    faChartColumn,
    faFolderOpen,
    faGear,
    faHouse,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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

const PREFIX = 'angular-components-style-guide.app-layout';
const PAGES = ['dashboard', 'documents', 'reports', 'settings', 'help'];
const BRAND_ICON =
    // eslint-disable-next-line max-len
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22%3E%3Crect width=%2272%22 height=%2272%22 rx=%2222%22 fill=%22%23111111%22/%3E%3Ccircle cx=%2226%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22/%3E%3Ccircle cx=%2246%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22 opacity=%220.9%22/%3E%3C/svg%3E';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AppLayoutComponent, ButtonComponent, TranslateModule],
    selector: 'bey-app-layout-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './app-layout-style-guide.component.css'],
    templateUrl: './app-layout-style-guide.component.html'
})
export class AppLayoutStyleGuideComponent {
    readonly config = new AppLayoutConfig({
        iconSrc: BRAND_ICON,
        productName: `${PREFIX}.title`,
        prefix: PREFIX,
        title: new LeftMenuTitle({ icon: BRAND_ICON, title: `${PREFIX}.title` }),
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
    readonly pageButtons = PAGES.map(
        page =>
            new ButtonConfig({
                action: () => this.appLayoutService.emitMenuClick(page),
                label: `${PREFIX}.actions.${page}.label`,
                type: ButtonType.Secondary
            })
    );

    private readonly appLayoutService = inject(AppLayoutService);
    private readonly translateService = inject(TranslateService);

    constructor() {
        this.translateService.onLangChange
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.navigateTo(this.appLayoutService.activeActionKey() ?? 'dashboard'));
    }

    private navigateTo(page: string): void {
        const trail = page.startsWith('reports-') ? ['reports', page] : [page];

        this.appLayoutService.setBreadcrumb(
            trail.map((key, index) => new AppLayoutBreadcrumbItem({ id: index + 1, label: this.translate(key) }))
        );
        this.appLayoutService.activeMenuAction(page);
    }

    private translate(key: string): string {
        return this.translateService.instant(`${PREFIX}.actions.${key}.label`);
    }
}
