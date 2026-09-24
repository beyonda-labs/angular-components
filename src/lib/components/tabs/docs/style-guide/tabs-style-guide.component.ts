import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { faChartLine, faCog, faFileAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { Tab, TabsConfig } from '../../models/tabs.model';
import { TabsComponent } from '../../tabs.component';

const PREFIX = 'angular-components-style-guide.tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TabsComponent, TranslateModule],
    selector: 'bey-tabs-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './tabs-style-guide.component.css'],
    templateUrl: './tabs-style-guide.component.html'
})
export class TabsStyleGuideComponent {
    readonly basicActiveKey = signal('overview');
    readonly iconsActiveKey = signal('analytics');
    readonly overflowActiveKey = signal('overview');

    readonly basicConfig = new TabsConfig({
        onTabChange: key => this.basicActiveKey.set(key),
        prefix: `${PREFIX}.basic`,
        tabs: [new Tab({ key: 'overview' }), new Tab({ key: 'details' }), new Tab({ key: 'history' })]
    });

    readonly iconsConfig = new TabsConfig({
        onTabChange: key => this.iconsActiveKey.set(key),
        prefix: `${PREFIX}.icons`,
        tabs: [
            new Tab({ key: 'analytics', icon: faChartLine }),
            new Tab({ key: 'documents', icon: faFileAlt }),
            new Tab({ key: 'settings', icon: faCog }),
            new Tab({ key: 'admin', icon: faLock, isDisabled: true })
        ]
    });

    readonly overflowConfig = new TabsConfig({
        onTabChange: key => this.overflowActiveKey.set(key),
        prefix: `${PREFIX}.overflow`,
        tabs: [
            new Tab({ key: 'overview' }),
            new Tab({ key: 'details' }),
            new Tab({ key: 'history' }),
            new Tab({ key: 'comments' }),
            new Tab({ key: 'activity' }),
            new Tab({ key: 'settings' }),
            new Tab({ key: 'permissions' })
        ]
    });
}
