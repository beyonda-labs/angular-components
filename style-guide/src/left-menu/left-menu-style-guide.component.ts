import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    BeyLeftMenuAction,
    BeyLeftMenuComponent,
    BeyLeftMenuConfig,
    BeyLeftMenuTitle,
    BeyLeftMenuUserInfo
} from '@beyonda-labs/angular-components';
import {
    faCalendarDays,
    faChartColumn,
    faCircleInfo,
    faComments,
    faEnvelope,
    faFileExport,
    faFolderOpen,
    faHouse,
    faInbox,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const BRAND_ICON =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"%3E%3Crect width="72" height="72" rx="22" fill="%23111111"/%3E%3Ccircle cx="26" cy="36" r="10" fill="%23ffffff"/%3E%3Ccircle cx="46" cy="36" r="10" fill="%23ffffff" opacity="0.9"/%3E%3C/svg%3E';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyLeftMenuComponent, TranslateModule],
    selector: 'bey-left-menu-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './left-menu-style-guide.component.css'],
    templateUrl: './left-menu-style-guide.component.html'
})
export class LeftMenuStyleGuideComponent {
    lastDocumentsClick: 'label' | null = null;

    collapsedConfig = this.buildConfig(false);
    expandedConfig = this.buildConfig(true);

    private buildConfig(expanded: boolean): BeyLeftMenuConfig {
        return new BeyLeftMenuConfig({
            bottomActions: [
                new BeyLeftMenuAction({
                    icon: faCircleInfo,
                    key: 'info'
                }),
                new BeyLeftMenuAction({
                    icon: faQuestionCircle,
                    key: 'support'
                })
            ],
            expanded,
            prefix: 'angular-components-style-guide.left-menu',
            title: new BeyLeftMenuTitle({
                icon: BRAND_ICON,
                title: 'angular-components-style-guide.left-menu.title'
            }),
            topActions: [
                new BeyLeftMenuAction({
                    icon: faHouse,
                    key: 'dashboard'
                }),
                new BeyLeftMenuAction({
                    icon: faCalendarDays,
                    key: 'calendar'
                }),
                new BeyLeftMenuAction({
                    action: () => (this.lastDocumentsClick = 'label'),
                    icon: faFolderOpen,
                    key: 'documents',
                    subActions: [
                        new BeyLeftMenuAction({
                            active: true,
                            icon: faInbox,
                            key: 'inbox'
                        }),
                        new BeyLeftMenuAction({
                            icon: faEnvelope,
                            key: 'incoming'
                        }),
                        new BeyLeftMenuAction({
                            icon: faFileExport,
                            key: 'export'
                        })
                    ]
                }),
                new BeyLeftMenuAction({
                    icon: faChartColumn,
                    key: 'statistics'
                }),
                new BeyLeftMenuAction({
                    icon: faComments,
                    key: 'chat'
                })
            ],
            userInfo: new BeyLeftMenuUserInfo({
                email: 'rustam@gmail.com',
                name: 'Abdulaev',
                surname: 'Rustam'
            })
        });
    }
}
