import { Injectable, signal } from '@angular/core';

import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from '../models/properties-menu-config.model';
import { PropertyField } from '../models/property-field.model';
import { PropertyGroup, PropertyGroupParameters } from '../models/property-group.model';
import { PropertyFieldsContent, PropertyGroupContentType, PropertyTreeContent } from '../models/property-group-content.model';
import { PropertyListItem } from '../models/property-list-item.model';
import { PropertyTab } from '../models/property-tab.model';
import { PropertyTreeConfig } from '../models/property-tree-config.model';
import { PropertyTreeNode, PropertyTreeNodeParameters } from '../models/property-tree-node.model';
import { PropertyVariable } from '../models/property-variable.model';
import {
    PropertyFieldAction,
    PropertyFieldValueChange,
    PropertyGroupRemove,
    PropertyGroupToggle,
    PropertyListItemSelect,
    PropertyTabAddRequested,
    PropertyTreeAddBlock,
    PropertyTreeNodeSelect,
    PropertyTreeNodeToggle,
    PropertyVariableSelection
} from '../types/properties-menu-events';

@Injectable()
export class PropertiesMenuService {
    readonly activeTabId = signal<string | null>(null);
    readonly config = signal<PropertiesMenuConfig>(new PropertiesMenuConfig({ prefix: '' }));
    readonly selectedTreeNodeId = signal<string | null>(null);

    onActiveTabChange?: (tabId: string) => void;
    onFieldAction?: (action: PropertyFieldAction) => void;
    onFieldValueChange?: (change: PropertyFieldValueChange) => void;
    onGroupRemove?: (event: PropertyGroupRemove) => void;
    onGroupToggle?: (toggle: PropertyGroupToggle) => void;
    onListItemSelect?: (event: PropertyListItemSelect) => void;
    onTabAddRequested?: (event: PropertyTabAddRequested) => void;
    onTreeAddBlock?: (event: PropertyTreeAddBlock) => void;
    onTreeNodeSelect?: (event: PropertyTreeNodeSelect) => void;
    onTreeNodeToggle?: (event: PropertyTreeNodeToggle) => void;
    onVariableSelected?: (selection: PropertyVariableSelection) => void;

    setConfig(config: PropertiesMenuConfigParameters | PropertiesMenuConfig): void {
        const resolvedConfig = config instanceof PropertiesMenuConfig ? config : new PropertiesMenuConfig(config);

        this.config.set(resolvedConfig);
        this.activeTabId.set(resolvedConfig.activeTabId || null);
        this.selectedTreeNodeId.set(this.findActiveTreeNodeId(resolvedConfig));
    }

    setActiveTab(tabId: string): void {
        const tab = this.config().tabs.find(current => current.id === tabId);

        if (!tab || tab.disabled || this.activeTabId() === tabId) {
            return;
        }

        this.activeTabId.set(tabId);
        this.onActiveTabChange?.(tabId);
    }

    toggleGroup(tabId: string, groupId: string): void {
        const group = this.getGroup(tabId, groupId);

        if (!group || !group.showHeader) {
            return;
        }

        let expanded = false;

        this.config.update(config =>
            this.updateGroup(config, tabId, groupId, current => {
                expanded = !current.expanded;

                return { ...current, expanded };
            })
        );

        this.onGroupToggle?.({ expanded, groupId, tabId });
    }

    updateFieldValue(fieldId: string, value: unknown): void {
        const previousValue = this.getField(fieldId)?.value;

        this.config.update(config => this.updateField(config, fieldId, value));

        this.onFieldValueChange?.({ fieldId, previousValue, value });
    }

    triggerFieldAction(fieldId: string, key: string, selectionStart: number, selectionEnd: number): void {
        this.onFieldAction?.({ fieldId, key, selectionEnd, selectionStart });
    }

    applyVariableSelection(fieldId: string, variable: PropertyVariable, value: unknown): void {
        const previousValue = this.getField(fieldId)?.value;

        this.config.update(config => this.updateField(config, fieldId, value));

        this.onFieldValueChange?.({ fieldId, previousValue, value });
        this.onVariableSelected?.({ expression: `{{ ${variable.path} }}`, fieldId, variable });
    }

    selectTreeNode(tabId: string, groupId: string, nodeId: string): void {
        const node = this.getTreeNode(tabId, groupId, nodeId);

        if (!node || node.disabled) {
            return;
        }

        this.selectedTreeNodeId.set(nodeId);
        this.onTreeNodeSelect?.({ groupId, node, nodeId, tabId });
    }

    toggleTreeNode(tabId: string, groupId: string, nodeId: string): void {
        let expanded = false;

        this.config.update(config =>
            this.updateTreeNode(config, tabId, groupId, nodeId, node => {
                expanded = !node.expanded;

                return { ...node, expanded };
            })
        );

        this.onTreeNodeToggle?.({ expanded, groupId, nodeId, tabId });
    }

    triggerTreeAddBlock(tabId: string, groupId: string): void {
        this.onTreeAddBlock?.({ groupId, tabId });
    }

    triggerTabAdd(tabId: string): void {
        this.onTabAddRequested?.({ tabId });
    }

    removeGroup(tabId: string, groupId: string): void {
        this.onGroupRemove?.({ groupId, tabId });
    }

    selectListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled) {
            return;
        }

        this.onListItemSelect?.({ groupId, item, itemId, tabId });
    }

    getGroup(tabId: string, groupId: string): PropertyGroup | undefined {
        const tab = this.config().tabs.find(current => current.id === tabId);

        return tab?.groups.find(group => group.id === groupId);
    }

    getListItem(tabId: string, groupId: string, itemId: string): PropertyListItem | undefined {
        const group = this.getGroup(tabId, groupId);

        return group?.content.type === PropertyGroupContentType.LIST
            ? group.content.list.find(item => item.id === itemId)
            : undefined;
    }

    getField(fieldId: string): PropertyField | undefined {
        for (const tab of this.config().tabs) {
            for (const group of tab.groups) {
                if (group.content.type !== PropertyGroupContentType.FIELDS) {
                    continue;
                }

                const field = group.content.fields.find(current => current.id === fieldId);

                if (field) {
                    return field;
                }
            }
        }

        return undefined;
    }

    getTreeNode(tabId: string, groupId: string, nodeId: string): PropertyTreeNode | undefined {
        const group = this.getGroup(tabId, groupId);

        return group?.content.type === PropertyGroupContentType.TREE
            ? this.findTreeNode(group.content.tree.nodes, nodeId)
            : undefined;
    }

    private findActiveTreeNodeId(config: PropertiesMenuConfig): string | null {
        for (const tab of config.tabs) {
            for (const group of tab.groups) {
                if (group.content.type !== PropertyGroupContentType.TREE) {
                    continue;
                }

                const found = this.findActiveNode(group.content.tree.nodes);

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    private findActiveNode(nodes: PropertyTreeNode[]): string | null {
        for (const node of nodes) {
            if (node.active) {
                return node.id;
            }

            const found = this.findActiveNode(node.children);

            if (found) {
                return found;
            }
        }

        return null;
    }

    private findTreeNode(nodes: PropertyTreeNode[], nodeId: string): PropertyTreeNode | undefined {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }

            const found = this.findTreeNode(node.children, nodeId);

            if (found) {
                return found;
            }
        }

        return undefined;
    }

    private updateTreeNode(
        config: PropertiesMenuConfig,
        tabId: string,
        groupId: string,
        nodeId: string,
        updater: (node: PropertyTreeNode) => PropertyTreeNodeParameters
    ): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            ...config,
            tabs: config.tabs.map((tab: PropertyTab) => {
                if (tab.id !== tabId) {
                    return tab;
                }

                return new PropertyTab({
                    ...tab,
                    groups: tab.groups.map(group => {
                        if (group.id !== groupId || group.content.type !== PropertyGroupContentType.TREE) {
                            return group;
                        }

                        return new PropertyGroup({
                            ...group,
                            content: new PropertyTreeContent({
                                tree: new PropertyTreeConfig({
                                    ...group.content.tree,
                                    nodes: this.mapTreeNodes(group.content.tree.nodes, nodeId, updater)
                                })
                            })
                        });
                    })
                });
            })
        });
    }

    private mapTreeNodes(
        nodes: PropertyTreeNode[],
        nodeId: string,
        updater: (node: PropertyTreeNode) => PropertyTreeNodeParameters
    ): PropertyTreeNode[] {
        return nodes.map(node => {
            if (node.id === nodeId) {
                return new PropertyTreeNode(updater(node));
            }

            if (node.children.length === 0) {
                return node;
            }

            return new PropertyTreeNode({ ...node, children: this.mapTreeNodes(node.children, nodeId, updater) });
        });
    }

    private updateGroup(
        config: PropertiesMenuConfig,
        tabId: string,
        groupId: string,
        updater: (group: PropertyGroup) => PropertyGroupParameters
    ): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            ...config,
            tabs: config.tabs.map((tab: PropertyTab) => {
                if (tab.id !== tabId) {
                    return tab;
                }

                return new PropertyTab({
                    ...tab,
                    groups: tab.groups.map(group => (group.id === groupId ? new PropertyGroup(updater(group)) : group))
                });
            })
        });
    }

    private updateField(config: PropertiesMenuConfig, fieldId: string, value: unknown): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            ...config,
            tabs: config.tabs.map((tab: PropertyTab) => {
                const hasField = tab.groups.some(
                    group => group.content.type === PropertyGroupContentType.FIELDS && group.content.fields.some(field => field.id === fieldId)
                );

                if (!hasField) {
                    return tab;
                }

                return new PropertyTab({
                    ...tab,
                    groups: tab.groups.map(group => {
                        if (group.content.type !== PropertyGroupContentType.FIELDS || !group.content.fields.some(field => field.id === fieldId)) {
                            return group;
                        }

                        return new PropertyGroup({
                            ...group,
                            content: new PropertyFieldsContent({
                                fields: group.content.fields.map(field => (field.id === fieldId ? field.withValue(value) : field))
                            })
                        });
                    })
                });
            })
        });
    }
}
