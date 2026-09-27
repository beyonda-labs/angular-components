import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyField } from './property-field.model';
import { PropertyListItem } from './property-list-item.model';
import { PropertyTreeConfig } from './property-tree-config.model';

export enum PropertyGroupContentType {
    FIELDS = 'fields',
    LIST = 'list',
    TABS = 'tabs',
    TREE = 'tree'
}

export type PropertyGroupContent =
    | PropertyFieldsContent
    | PropertyListContent
    | PropertyTabsContent
    | PropertyTreeContent;

export class PropertyFieldsContent {
    fields: PropertyField[];
    readonly type = PropertyGroupContentType.FIELDS;

    constructor({ fields = [] }: PropertyFieldsContentParameters) {
        this.fields = fields;
    }
}

export class PropertyGroupTab {
    fields: PropertyField[];
    id: string;
    label: string;

    icon?: IconDefinition;

    constructor({ fields = [], icon, id, label = `${id}.label` }: PropertyGroupTabParameters) {
        this.fields = fields;
        this.icon = icon;
        this.id = id;
        this.label = label;
    }
}

export class PropertyListContent {
    list: PropertyListItem[];
    readonly type = PropertyGroupContentType.LIST;

    constructor({ list = [] }: PropertyListContentParameters) {
        this.list = list;
    }
}

export class PropertyTabsContent {
    activeTabId: string;
    tabs: PropertyGroupTab[];
    readonly type = PropertyGroupContentType.TABS;

    constructor({ activeTabId, tabs = [] }: PropertyTabsContentParameters) {
        this.tabs = tabs;
        this.activeTabId = activeTabId ?? tabs[0]?.id ?? '';
    }
}

export class PropertyTreeContent {
    tree: PropertyTreeConfig;
    readonly type = PropertyGroupContentType.TREE;

    constructor({ tree = new PropertyTreeConfig({}) }: PropertyTreeContentParameters) {
        this.tree = tree;
    }
}

export interface PropertyFieldsContentParameters {
    fields?: PropertyField[];
}

export interface PropertyGroupTabParameters {
    id: string;

    fields?: PropertyField[];
    icon?: IconDefinition;
    label?: string;
}

export interface PropertyListContentParameters {
    list?: PropertyListItem[];
}

export interface PropertyTabsContentParameters {
    activeTabId?: string;
    tabs?: PropertyGroupTab[];
}

export interface PropertyTreeContentParameters {
    tree?: PropertyTreeConfig;
}
