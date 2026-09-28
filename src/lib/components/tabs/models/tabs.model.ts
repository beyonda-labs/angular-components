import { IconDefinition } from '@fortawesome/angular-fontawesome';

export enum TabsVariant {
    Segmented = 'segmented',
    Underline = 'underline'
}

export class Tab {
    isDisabled: boolean;
    key: string;
    label: string;
    tooltip: string;

    icon?: IconDefinition;
    labelParameters?: Record<string, unknown>;

    constructor({
        icon,
        isDisabled = false,
        key,
        label = `${key}.label`,
        labelParameters,
        tooltip = ''
    }: TabParameters) {
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.key = key;
        this.label = label;
        this.labelParameters = labelParameters;
        this.tooltip = tooltip;
    }
}

export class TabsConfig {
    activeTab: string;
    prefix: string;
    tabs: Tab[];
    variant: TabsVariant;

    onTabChange?: (key: string) => void;

    constructor({ activeTab, onTabChange, prefix, tabs, variant = TabsVariant.Underline }: TabsConfigParameters) {
        this.activeTab = activeTab ?? tabs[0]?.key ?? '';
        this.onTabChange = onTabChange;
        this.prefix = prefix;
        this.tabs = tabs;
        this.variant = variant;
    }
}

export interface TabParameters {
    key: string;

    icon?: IconDefinition;
    isDisabled?: boolean;
    label?: string;
    labelParameters?: Record<string, unknown>;
    tooltip?: string;
}

export interface TabsConfigParameters {
    prefix: string;
    tabs: Tab[];

    activeTab?: string;
    onTabChange?: (key: string) => void;
    variant?: TabsVariant;
}
