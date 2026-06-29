import { Component, inject } from '@angular/core';
import { faChartLine, faCog, faFileAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Tab, TabsConfig } from '../../models/tabs.model';
import { TabsComponent } from '../../tabs.component';

@Component({
    imports: [TabsComponent, TranslateModule],
    selector: 'bey-tabs-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './tabs-style-guide.component.css'],
    templateUrl: './tabs-style-guide.component.html'
})
export class TabsStyleGuideComponent {
    activeKey1 = 'overview';
    activeKey2 = 'analytics';

    basicConfig: TabsConfig;
    iconsConfig: TabsConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.basicConfig = new TabsConfig({
            onTabChange: key => {
                this.activeKey1 = key;
                const message = this.translateService.instant('angular-components-style-guide.tabs.changed');
                //eslint-disable-next-line no-console
                console.log(message, key);
            },
            prefix: 'angular-components-style-guide.tabs.basic',
            tabs: [new Tab({ key: 'overview' }), new Tab({ key: 'details' }), new Tab({ key: 'history' })]
        });

        this.iconsConfig = new TabsConfig({
            onTabChange: key => {
                this.activeKey2 = key;
            },
            prefix: 'angular-components-style-guide.tabs.icons',
            tabs: [
                new Tab({ key: 'analytics', icon: faChartLine }),
                new Tab({ key: 'documents', icon: faFileAlt }),
                new Tab({ key: 'settings', icon: faCog }),
                new Tab({ key: 'admin', icon: faLock, isDisabled: true })
            ]
        });
    }
}
