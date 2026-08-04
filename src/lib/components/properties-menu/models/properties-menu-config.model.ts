import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyTab } from './property-tab.model';

export interface PropertiesMenuConfigParameters {
    prefix: string;

    activeTabId?: string;
    embedded?: boolean;
    icon?: IconDefinition;
    subtitle?: string;
    tabs?: PropertyTab[];
    title?: string;
}

export class PropertiesMenuConfig {
    activeTabId: string;
    embedded: boolean;
    prefix: string;
    subtitle: string;
    tabs: PropertyTab[];
    title: string;

    icon?: IconDefinition;

    constructor({
        activeTabId,
        embedded = false,
        icon,
        prefix,
        subtitle = '',
        tabs = [],
        title = 'title'
    }: PropertiesMenuConfigParameters) {
        this.embedded = embedded;
        this.icon = icon;
        this.prefix = prefix;
        this.subtitle = subtitle;
        this.tabs = tabs;
        this.title = title;
        this.activeTabId = activeTabId ?? this.tabs.find(tab => !tab.hidden)?.id ?? '';
    }
}
