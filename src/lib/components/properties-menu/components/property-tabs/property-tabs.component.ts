import { Component, computed, inject, Signal } from '@angular/core';

import { Tab, TabsConfig } from '../../../tabs/models/tabs.model';
import { TabsComponent } from '../../../tabs/tabs.component';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';

@Component({
    imports: [TabsComponent],
    selector: 'bey-property-tabs',
    standalone: true,
    styleUrls: ['./property-tabs.component.css'],
    templateUrl: './property-tabs.component.html'
})
export class PropertyTabsComponent {
    private readonly propertiesMenuService = inject(PropertiesMenuService);

    /**
     * Computed (not a getter) so it only re-runs when `config`/`activeTabId` actually change.
     * A getter used in a template binding is re-evaluated on every change-detection cycle; since
     * it built a brand-new TabsConfig/Tab[] every time, TabsComponent's `[config]` input setter
     * saw a "new" reference on every tick, which reset its cached widths and rescheduled its
     * `requestAnimationFrame` recalculation — a self-sustaining reflow loop that never settled.
     */
    // eslint-disable-next-line unicorn/consistent-function-scoping
    readonly tabsConfig: Signal<TabsConfig> = computed(() => {
        const config = this.propertiesMenuService.config();

        return new TabsConfig({
            prefix: 'angular-components.properties-menu.tabs',
            activeTab: this.propertiesMenuService.activeTabId() ?? undefined,
            onTabChange: tabId => this.propertiesMenuService.setActiveTab(tabId),
            tabs: config.tabs
                .filter(tab => !tab.hidden)
                .map(
                    tab =>
                        new Tab({
                            icon: tab.icon,
                            isDisabled: tab.disabled,
                            key: tab.id,
                            label: resolvePropertyLabelKey(config.prefix, 'tabs', tab.id, tab.label)
                        })
                )
        });
    });
}
