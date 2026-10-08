import { Injectable, signal, untracked } from '@angular/core';

import { keepPropertiesMenuState } from '../functions/properties-menu-state';
import { toVariableExpression } from '../functions/property-variable-options';
import { PropertiesMenuConfig } from '../models/properties-menu-config.model';
import { PropertyField } from '../models/property-field.model';
import { PropertyGroup, PropertyGroupParameters } from '../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyGroupContentType,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from '../models/property-group-content.model';
import { PropertyListItem, PropertyListItemParameters } from '../models/property-list-item.model';
import { PropertyTab } from '../models/property-tab.model';
import { PropertyTreeConfig } from '../models/property-tree-config.model';
import { PropertyTreeNode, PropertyTreeNodeParameters } from '../models/property-tree-node.model';
import { PropertyVariable } from '../models/property-variable.model';

@Injectable()
export class PropertiesMenuService {
    private readonly _activeTabId = signal<string | null>(null);
    private readonly _config = signal<PropertiesMenuConfig>(new PropertiesMenuConfig({ prefix: '' }));
    private readonly _selectedTreeNodeId = signal<string | null>(null);
    private readonly _variables = signal<PropertyVariable[]>([]);
    private consumerConfig: PropertiesMenuConfig | null = null;

    readonly activeTabId = this._activeTabId.asReadonly();
    readonly config = this._config.asReadonly();
    readonly selectedTreeNodeId = this._selectedTreeNodeId.asReadonly();
    readonly variables = this._variables.asReadonly();

    applyVariableSelection(fieldId: string, variable: PropertyVariable, value: unknown): void {
        this.updateFieldValue(fieldId, value);
        this.config().onVariableSelect?.({ expression: toVariableExpression(variable), fieldId, variable });
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

    getTreeNode(tabId: string, groupId: string, nodeId: string): PropertyTreeNode | undefined {
        const group = this.getGroup(tabId, groupId);

        return group?.content.type === PropertyGroupContentType.TREE
            ? this.findTreeNode(group.content.tree.nodes, nodeId)
            : undefined;
    }

    removeGroup(tabId: string, groupId: string): void {
        this.config().onGroupRemove?.({ groupId, tabId });
    }

    removeListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled || !item.removable) {
            return;
        }

        this.config().onListItemRemove?.({ groupId, itemId, tabId });
    }

    requestAttachmentUpload(fieldId: string, file: File): void {
        this.config().onAttachmentUpload?.({ fieldId, file });
    }

    selectGroupTab(tabId: string, groupId: string, contentTabId: string): void {
        this._config.update(config =>
            this.updateGroup(config, tabId, groupId, current => {
                if (current.content.type !== PropertyGroupContentType.TABS) {
                    return current;
                }

                return {
                    ...current,
                    content: new PropertyTabsContent({ ...current.content, activeTabId: contentTabId })
                };
            })
        );
    }

    selectListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled) {
            return;
        }

        this.config().onListItemSelect?.({ groupId, item, itemId, tabId });
    }

    selectTreeNode(tabId: string, groupId: string, nodeId: string): void {
        const node = this.getTreeNode(tabId, groupId, nodeId);

        if (!node || node.disabled) {
            return;
        }

        this._selectedTreeNodeId.set(nodeId);
        this.config().onTreeNodeSelect?.({ groupId, node, nodeId, tabId });
    }

    setActiveTab(tabId: string): void {
        const tab = this.config().tabs.find(current => current.id === tabId);

        if (!tab || tab.disabled || this.activeTabId() === tabId) {
            return;
        }

        this._activeTabId.set(tabId);
        this.config().onActiveTabChange?.(tabId);
    }

    setConfig(config: PropertiesMenuConfig): void {
        const state = untracked(() =>
            keepPropertiesMenuState(
                this.consumerConfig,
                {
                    activeTabId: this._activeTabId(),
                    config: this._config(),
                    selectedTreeNodeId: this._selectedTreeNodeId()
                },
                config
            )
        );

        this.consumerConfig = config;
        this._activeTabId.set(state.activeTabId);
        this._config.set(state.config);
        this._selectedTreeNodeId.set(state.selectedTreeNodeId);
    }

    setVariables(variables: PropertyVariable[]): void {
        this._variables.set(variables);
    }

    toggleGroup(tabId: string, groupId: string): void {
        const group = this.getGroup(tabId, groupId);

        if (!group || !group.showHeader) {
            return;
        }

        let expanded = false;

        this._config.update(config =>
            this.updateGroup(config, tabId, groupId, current => {
                expanded = !current.expanded;

                return { ...current, expanded };
            })
        );

        this.config().onGroupToggle?.({ expanded, groupId, tabId });
    }

    toggleListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled || !item.isExpandable) {
            return;
        }

        const expanded = !item.expanded;

        this._config.update(config =>
            this.updateListItem(config, tabId, groupId, itemId, current => ({ ...current, expanded }))
        );

        this.config().onListItemToggle?.({ expanded, groupId, itemId, tabId });
    }

    toggleTreeNode(tabId: string, groupId: string, nodeId: string): void {
        let expanded = false;

        this._config.update(config =>
            this.updateTreeNode(config, tabId, groupId, nodeId, node => {
                expanded = !node.expanded;

                return { ...node, expanded };
            })
        );

        this.config().onTreeNodeToggle?.({ expanded, groupId, nodeId, tabId });
    }

    triggerFieldAction(fieldId: string, key: string, selectionStart: number, selectionEnd: number): void {
        this.config().onFieldAction?.({ fieldId, key, selectionEnd, selectionStart });
    }

    triggerListItemAction(tabId: string, groupId: string, itemId: string, key: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled) {
            return;
        }

        this.config().onListItemAction?.({ groupId, itemId, key, tabId });
    }

    triggerTabAdd(tabId: string): void {
        this.config().onTabAdd?.({ tabId });
    }

    triggerTreeAddBlock(tabId: string, groupId: string): void {
        this.config().onTreeAddBlock?.({ groupId, tabId });
    }

    updateFieldValue(fieldId: string, value: unknown): void {
        const previousValue = this.getField(fieldId)?.value;

        this._config.update(config => this.updateField(config, fieldId, value));

        this.config().onFieldValueChange?.({ fieldId, previousValue, value });
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

    private updateField(config: PropertiesMenuConfig, fieldId: string, value: unknown): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            ...config,
            tabs: config.tabs.map((tab: PropertyTab) => {
                const hasField = tab.groups.some(
                    group =>
                        group.content.type === PropertyGroupContentType.FIELDS &&
                        group.content.fields.some(field => field.id === fieldId)
                );

                if (!hasField) {
                    return tab;
                }

                return new PropertyTab({
                    ...tab,
                    groups: tab.groups.map(group => {
                        if (
                            group.content.type !== PropertyGroupContentType.FIELDS ||
                            !group.content.fields.some(field => field.id === fieldId)
                        ) {
                            return group;
                        }

                        return new PropertyGroup({
                            ...group,
                            content: new PropertyFieldsContent({
                                fields: group.content.fields.map(field =>
                                    field.id === fieldId ? field.withValue(value) : field
                                )
                            })
                        });
                    })
                });
            })
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

    private updateListItem(
        config: PropertiesMenuConfig,
        tabId: string,
        groupId: string,
        itemId: string,
        updater: (item: PropertyListItem) => PropertyListItemParameters
    ): PropertiesMenuConfig {
        return this.updateGroup(config, tabId, groupId, group => {
            if (group.content.type !== PropertyGroupContentType.LIST) {
                return group;
            }

            return {
                ...group,
                content: new PropertyListContent({
                    list: (group.content as PropertyListContent).list.map(item =>
                        item.id === itemId ? new PropertyListItem(updater(item)) : item
                    )
                })
            };
        });
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
}
