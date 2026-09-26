import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BeyTab, BeyTabsComponent, BeyTabsConfig } from '@beyonda-labs/angular-components';
import { faChartLine, faCog, faFileAlt, faLock } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.tabs';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyTabsComponent, TranslateModule],
    selector: 'bey-tabs-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './tabs-style-guide.component.css'],
    templateUrl: './tabs-style-guide.component.html'
})
export class TabsStyleGuideComponent {
    readonly basicActiveKey = signal('overview');
    readonly iconsActiveKey = signal('analytics');
    readonly overflowActiveKey = signal('overview');

    readonly basicConfig = new BeyTabsConfig({
        onTabChange: key => this.basicActiveKey.set(key),
        prefix: `${PREFIX}.basic`,
        tabs: [new BeyTab({ key: 'overview' }), new BeyTab({ key: 'details' }), new BeyTab({ key: 'history' })]
    });

    readonly iconsConfig = new BeyTabsConfig({
        onTabChange: key => this.iconsActiveKey.set(key),
        prefix: `${PREFIX}.icons`,
        tabs: [
            new BeyTab({ key: 'analytics', icon: faChartLine }),
            new BeyTab({ key: 'documents', icon: faFileAlt }),
            new BeyTab({ key: 'settings', icon: faCog }),
            new BeyTab({ key: 'admin', icon: faLock, isDisabled: true })
        ]
    });

    readonly overflowConfig = new BeyTabsConfig({
        onTabChange: key => this.overflowActiveKey.set(key),
        prefix: `${PREFIX}.overflow`,
        tabs: [
            new BeyTab({ key: 'overview' }),
            new BeyTab({ key: 'details' }),
            new BeyTab({ key: 'history' }),
            new BeyTab({ key: 'comments' }),
            new BeyTab({ key: 'activity' }),
            new BeyTab({ key: 'settings' }),
            new BeyTab({ key: 'permissions' })
        ]
    });
}
