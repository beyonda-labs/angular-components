import { PropertyField } from './property-field.model';
import { PropertyListItem } from './property-list-item.model';
import { PropertyTreeConfig } from './property-tree-config.model';

export enum PropertyGroupContentType {
    FIELDS = 'fields',
    LIST = 'list',
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

export type PropertyGroupContent = PropertyFieldsContent | PropertyListContent | PropertyTreeContent;
