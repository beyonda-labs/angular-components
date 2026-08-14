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

export interface PropertyFieldsContentParameters {
    fields?: PropertyField[];
}

export class PropertyFieldsContent {
    readonly type = PropertyGroupContentType.FIELDS;

    fields: PropertyField[];

    constructor({ fields = [] }: PropertyFieldsContentParameters) {
        this.fields = fields;
    }
}

export interface PropertyListContentParameters {
    list?: PropertyListItem[];
}

export class PropertyListContent {
    readonly type = PropertyGroupContentType.LIST;

    list: PropertyListItem[];

    constructor({ list = [] }: PropertyListContentParameters) {
        this.list = list;
    }
}

export interface PropertyTreeContentParameters {
    tree?: PropertyTreeConfig;
}

export class PropertyTreeContent {
    readonly type = PropertyGroupContentType.TREE;

    tree: PropertyTreeConfig;

    constructor({ tree = new PropertyTreeConfig({}) }: PropertyTreeContentParameters) {
        this.tree = tree;
    }
}

export interface PropertyGroupTabParameters {
    id: string;

    fields?: PropertyField[];
    icon?: IconDefinition;
    label?: string;
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

export interface PropertyTabsContentParameters {
    activeTabId?: string;
    tabs?: PropertyGroupTab[];
}

export class PropertyTabsContent {
    readonly type = PropertyGroupContentType.TABS;

    activeTabId: string;
    tabs: PropertyGroupTab[];

    constructor({ activeTabId, tabs = [] }: PropertyTabsContentParameters) {
        this.tabs = tabs;
        this.activeTabId = activeTabId ?? tabs[0]?.id ?? '';
    }
}

export type PropertyGroupContent =
    | PropertyFieldsContent
    | PropertyListContent
    | PropertyTabsContent
    | PropertyTreeContent;
