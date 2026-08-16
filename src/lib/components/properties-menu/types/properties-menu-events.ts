import { PropertyListItem } from '../models/property-list-item.model';
import { PropertyTreeNode } from '../models/property-tree-node.model';
import { PropertyVariable } from '../models/property-variable.model';

export interface PropertyAttachmentUpload {
    fieldId: string;
    file: File;
}

export interface PropertyFieldAction {
    fieldId: string;
    key: string;
    selectionEnd: number;
    selectionStart: number;
}

export interface PropertyFieldValueChange<T = unknown> {
    fieldId: string;
    previousValue: T | undefined;
    value: T | undefined;
}

export interface PropertyGroupRemove {
    groupId: string;
    tabId: string;
}

export interface PropertyGroupToggle {
    expanded: boolean;
    groupId: string;
    tabId: string;
}

export interface PropertyListItemSelect {
    groupId: string;
    item: PropertyListItem;
    itemId: string;
    tabId: string;
}

export interface PropertyListItemAction {
    groupId: string;
    itemId: string;
    key: string;
    tabId: string;
}

export interface PropertyListItemRemove {
    groupId: string;
    itemId: string;
    tabId: string;
}

export interface PropertyListItemToggle {
    expanded: boolean;
    groupId: string;
    itemId: string;
    tabId: string;
}

export interface PropertyTabAddRequested {
    tabId: string;
}

export interface PropertyTreeAddBlock {
    groupId: string;
    tabId: string;
}

export interface PropertyTreeNodeSelect {
    groupId: string;
    node: PropertyTreeNode;
    nodeId: string;
    tabId: string;
}

export interface PropertyTreeNodeToggle {
    expanded: boolean;
    groupId: string;
    nodeId: string;
    tabId: string;
}

export interface PropertyVariableSelection {
    expression: string;
    fieldId: string;
    variable: PropertyVariable;
}
