import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class TabsConfig {
    activeTab: string;
    prefix: string;
    tabs: Tab[];

    onTabChange?: (key: string) => void;

    constructor({ activeTab, prefix, tabs, onTabChange }: TabsConfigParameters) {
        this.prefix = prefix;
        this.tabs = tabs;
        this.onTabChange = onTabChange;
        this.activeTab = activeTab ?? this.tabs[0]?.key ?? '';
    }

    setActiveTab(key: string, emitChange = true): void {
        const tab = this.tabs.find(t => t.key === key);

        if (!tab || tab.isDisabled || this.activeTab === key) {
            return;
        }

        this.activeTab = key;

        if (emitChange) {
            this.onTabChange?.(key);
        }
    }
}

export interface TabsConfigParameters {
    prefix: string;
    tabs: Tab[];

    activeTab?: string;
    onTabChange?: (key: string) => void;
}

export class Tab {
    key: string;
    label: string;
    tooltip: string;
    isDisabled: boolean;

    icon?: IconDefinition;

    constructor({ key, icon, isDisabled = false, label = `${key}.label`, tooltip = '' }: TabParameters) {
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.key = key;
        this.label = label;
        this.tooltip = tooltip;
    }
}

export interface TabParameters {
    key: string;

    icon?: IconDefinition;
    isDisabled?: boolean;
    label?: string;
    tooltip?: string;
}
