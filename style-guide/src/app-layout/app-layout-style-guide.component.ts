import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BeyAppLayoutBottomAction,
    BeyAppLayoutBreadcrumbItem,
    BeyAppLayoutComponent,
    BeyAppLayoutConfig,
    BeyAppLayoutService,
    BeyAppLayoutTopAction,
    BeyLeftMenuTitle,
    BeyLeftMenuUserInfo
} from '@beyonda-labs/angular-components';
import {
    faCalendarDays,
    faChartColumn,
    faFolderOpen,
    faGear,
    faHouse,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';

const PREFIX = 'angular-components-style-guide.app-layout';
const PAGES = ['dashboard', 'documents', 'reports', 'settings', 'help'];
const BRAND_ICON =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22%3E%3Crect width=%2272%22 height=%2272%22 rx=%2222%22 fill=%22%23111111%22/%3E%3Ccircle cx=%2226%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22/%3E%3Ccircle cx=%2246%22 cy=%2236%22 r=%2210%22 fill=%22%23ffffff%22 opacity=%220.9%22/%3E%3C/svg%3E';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAppLayoutComponent, TranslateModule],
    selector: 'bey-app-layout-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './app-layout-style-guide.component.css'],
    templateUrl: './app-layout-style-guide.component.html'
})
export class AppLayoutStyleGuideComponent {
    readonly config = new BeyAppLayoutConfig({
        iconSrc: BRAND_ICON,
        productName: `${PREFIX}.title`,
        prefix: PREFIX,
        title: new BeyLeftMenuTitle({ icon: BRAND_ICON, title: `${PREFIX}.title` }),
        topActions: [
            new BeyAppLayoutTopAction({ icon: faHouse, key: 'dashboard' }),
            new BeyAppLayoutTopAction({ icon: faFolderOpen, key: 'documents' }),
            new BeyAppLayoutTopAction({
                icon: faChartColumn,
                key: 'reports',
                subActions: [
                    new BeyAppLayoutTopAction({ icon: faCalendarDays, key: 'reports-monthly' }),
                    new BeyAppLayoutTopAction({ icon: faChartColumn, key: 'reports-annual' })
                ]
            })
        ],
        bottomActions: [
            new BeyAppLayoutBottomAction({ icon: faGear, key: 'settings' }),
            new BeyAppLayoutBottomAction({ icon: faQuestionCircle, key: 'help' })
        ],
        privacyUrl: '/privacy',
        termsUrl: '/terms',
        userInfo: new BeyLeftMenuUserInfo({ email: 'demo@beyonda.dev', name: 'Demo', surname: 'User' }),
        onMenuActionClick: (page: string) => this.navigateTo(page),
        onLayoutInitialized: () => this.navigateTo('dashboard')
    });
    readonly pageButtons: StyleGuideButton[] = PAGES.map(page => ({
        action: () => this.appLayoutService.emitMenuClick(page),
        label: `${PREFIX}.actions.${page}.label`
    }));

    private readonly appLayoutService = inject(BeyAppLayoutService);
    private readonly translateService = inject(TranslateService);

    constructor() {
        this.translateService.onLangChange
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.navigateTo(this.appLayoutService.activeActionKey() ?? 'dashboard'));
    }

    private navigateTo(page: string): void {
        const trail = page.startsWith('reports-') ? ['reports', page] : [page];

        this.appLayoutService.setBreadcrumb(
            trail.map((key, index) => new BeyAppLayoutBreadcrumbItem({ id: index + 1, label: this.translate(key) }))
        );
        this.appLayoutService.activeMenuAction(page);
    }

    private translate(key: string): string {
        return this.translateService.instant(`${PREFIX}.actions.${key}.label`);
    }
}
