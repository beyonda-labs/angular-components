import { IconDefinition } from '@fortawesome/angular-fontawesome';

import {
    PropertyAttachmentUpload,
    PropertyFieldAction,
    PropertyFieldValueChange,
    PropertyGroupRemove,
    PropertyGroupToggle,
    PropertyListItemAction,
    PropertyListItemRemove,
    PropertyListItemSelect,
    PropertyListItemToggle,
    PropertyTabAdd,
    PropertyTreeAddBlock,
    PropertyTreeDragEnd,
    PropertyTreeDragStart,
    PropertyTreeDrop,
    PropertyTreeNodeSelect,
    PropertyTreeNodeToggle,
    PropertyVariableSelection
} from './properties-menu-events.model';
import { PropertyTab } from './property-tab.model';

export class PropertiesMenuConfig {
    activeTabId: string;
    embedded: boolean;
    prefix: string;
    subtitle: string;
    tabs: PropertyTab[];
    title: string;

    icon?: IconDefinition;
    onActiveTabChange?: (tabId: string) => void;
    onAttachmentUpload?: (upload: PropertyAttachmentUpload) => void;
    onClose?: () => void;
    onFieldAction?: (action: PropertyFieldAction) => void;
    onFieldValueChange?: (change: PropertyFieldValueChange) => void;
    onGroupRemove?: (event: PropertyGroupRemove) => void;
    onGroupToggle?: (event: PropertyGroupToggle) => void;
    onListItemAction?: (event: PropertyListItemAction) => void;
    onListItemRemove?: (event: PropertyListItemRemove) => void;
    onListItemSelect?: (event: PropertyListItemSelect) => void;
    onListItemToggle?: (event: PropertyListItemToggle) => void;
    onTabAdd?: (event: PropertyTabAdd) => void;
    onTreeAddBlock?: (event: PropertyTreeAddBlock) => void;
    onTreeDragEnd?: (event: PropertyTreeDragEnd) => void;
    onTreeDragStart?: (event: PropertyTreeDragStart) => void;
    onTreeDrop?: (event: PropertyTreeDrop) => void;
    onTreeNodeSelect?: (event: PropertyTreeNodeSelect) => void;
    onTreeNodeToggle?: (event: PropertyTreeNodeToggle) => void;
    onVariableSelect?: (selection: PropertyVariableSelection) => void;

    constructor({
        activeTabId,
        embedded = false,
        icon,
        prefix,
        subtitle = '',
        tabs = [],
        title = 'title',
        ...callbacks
    }: PropertiesMenuConfigParameters) {
        Object.assign(this, callbacks);
        this.embedded = embedded;
        this.icon = icon;
        this.prefix = prefix;
        this.subtitle = subtitle;
        this.tabs = tabs;
        this.title = title;
        this.activeTabId = activeTabId ?? this.tabs.find(tab => !tab.hidden)?.id ?? '';
    }
}

export interface PropertiesMenuConfigParameters {
    prefix: string;

    activeTabId?: string;
    embedded?: boolean;
    icon?: IconDefinition;
    onActiveTabChange?: (tabId: string) => void;
    onAttachmentUpload?: (upload: PropertyAttachmentUpload) => void;
    /** When set, the header shows a close button that calls it. */
    onClose?: () => void;
    onFieldAction?: (action: PropertyFieldAction) => void;
    onFieldValueChange?: (change: PropertyFieldValueChange) => void;
    onGroupRemove?: (event: PropertyGroupRemove) => void;
    onGroupToggle?: (event: PropertyGroupToggle) => void;
    onListItemAction?: (event: PropertyListItemAction) => void;
    onListItemRemove?: (event: PropertyListItemRemove) => void;
    onListItemSelect?: (event: PropertyListItemSelect) => void;
    onListItemToggle?: (event: PropertyListItemToggle) => void;
    onTabAdd?: (event: PropertyTabAdd) => void;
    onTreeAddBlock?: (event: PropertyTreeAddBlock) => void;
    onTreeDragEnd?: (event: PropertyTreeDragEnd) => void;
    onTreeDragStart?: (event: PropertyTreeDragStart) => void;
    onTreeDrop?: (event: PropertyTreeDrop) => void;
    onTreeNodeSelect?: (event: PropertyTreeNodeSelect) => void;
    onTreeNodeToggle?: (event: PropertyTreeNodeToggle) => void;
    onVariableSelect?: (selection: PropertyVariableSelection) => void;
    subtitle?: string;
    tabs?: PropertyTab[];
    title?: string;
}
