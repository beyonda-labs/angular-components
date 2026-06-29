import { Component } from '@angular/core';
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

import { LeftMenuComponent } from '../../left-menu.component';
import { LeftMenuAction, LeftMenuConfig, LeftMenuTitle, LeftMenuUserInfo } from '../../models/left-menu.model';

const BRAND_ICON =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"%3E%3Crect width="72" height="72" rx="22" fill="%23111111"/%3E%3Ccircle cx="26" cy="36" r="10" fill="%23ffffff"/%3E%3Ccircle cx="46" cy="36" r="10" fill="%23ffffff" opacity="0.9"/%3E%3C/svg%3E';

@Component({
    imports: [LeftMenuComponent, TranslateModule],
    selector: 'bey-left-menu-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './left-menu-style-guide.component.css'],
    templateUrl: './left-menu-style-guide.component.html'
})
export class LeftMenuStyleGuideComponent {
    collapsedConfig = this.buildConfig(false);
    expandedConfig = this.buildConfig(true);

    private buildConfig(expanded: boolean): LeftMenuConfig {
        return new LeftMenuConfig({
            bottomActions: [
                new LeftMenuAction({
                    icon: faCircleInfo,
                    key: 'info'
                }),
                new LeftMenuAction({
                    icon: faQuestionCircle,
                    key: 'support'
                })
            ],
            expanded,
            prefix: 'angular-components-style-guide.leftMenu',
            title: new LeftMenuTitle({
                icon: BRAND_ICON,
                title: 'angular-components-style-guide.leftMenu.title'
            }),
            topActions: [
                new LeftMenuAction({
                    icon: faHouse,
                    key: 'dashboard'
                }),
                new LeftMenuAction({
                    icon: faCalendarDays,
                    key: 'calendar'
                }),
                new LeftMenuAction({
                    icon: faFolderOpen,
                    key: 'documents',
                    subActions: [
                        new LeftMenuAction({
                            active: true,
                            icon: faInbox,
                            key: 'inbox'
                        }),
                        new LeftMenuAction({
                            icon: faEnvelope,
                            key: 'incoming'
                        }),
                        new LeftMenuAction({
                            icon: faFileExport,
                            key: 'export'
                        })
                    ]
                }),
                new LeftMenuAction({
                    icon: faChartColumn,
                    key: 'statistics'
                }),
                new LeftMenuAction({
                    icon: faComments,
                    key: 'chat'
                })
            ],
            userInfo: new LeftMenuUserInfo({
                email: 'rustam@gmail.com',
                name: 'Abdulaev',
                surname: 'Rustam'
            })
        });
    }
}
