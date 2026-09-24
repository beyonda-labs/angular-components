import { IconDefinition } from '@fortawesome/angular-fontawesome';

export enum TabsVariant {
    Segmented = 'segmented',
    Underline = 'underline'
}

export class TabsConfig {
    activeTab: string;
    prefix: string;
    tabs: Tab[];
    variant: TabsVariant;

    onTabChange?: (key: string) => void;

    constructor({ activeTab, prefix, tabs, onTabChange, variant = TabsVariant.Underline }: TabsConfigParameters) {
        this.prefix = prefix;
        this.tabs = tabs;
        this.onTabChange = onTabChange;
        this.variant = variant;
        this.activeTab = activeTab ?? this.tabs[0]?.key ?? '';
    }
}

export interface TabsConfigParameters {
    prefix: string;
    tabs: Tab[];

    activeTab?: string;
    onTabChange?: (key: string) => void;
    variant?: TabsVariant;
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
