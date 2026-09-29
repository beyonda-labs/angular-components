import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Tab, TabsConfig } from '../../../tabs/models/tabs.model';
import { TabsComponent } from '../../../tabs/tabs.component';
import { resolvePropertyLabelKey } from '../../functions/property-i18n';
import { PropertiesMenuService } from '../../services/properties-menu.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TabsComponent],
    selector: 'bey-property-tabs',
    standalone: true,
    styleUrls: ['./property-tabs.component.css'],
    templateUrl: './property-tabs.component.html'
})
export class PropertyTabsComponent {
    readonly tabsConfig = computed(() => {
        const config = this.propertiesMenuService.config();

        return new TabsConfig({
            activeTab: this.propertiesMenuService.activeTabId() ?? undefined,
            onTabChange: tabId => this.propertiesMenuService.setActiveTab(tabId),
            prefix: 'angular-components.properties-menu.tabs',
            tabs: config.tabs
                .filter(tab => !tab.hidden)
                .map(
                    tab =>
                        new Tab({
                            icon: tab.icon,
                            isDisabled: tab.disabled,
                            key: tab.id,
                            label: resolvePropertyLabelKey(config.prefix, 'tabs', tab.id, tab.label),
                            labelParameters: tab.labelParameters
                        })
                )
        });
    });

    private readonly propertiesMenuService = inject(PropertiesMenuService);
}
