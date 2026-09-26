import { Injectable, signal } from '@angular/core';

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
import { toVariableExpression } from '../utils/property-variable-options.util';

/**
 * Menu state shared by the menu's inner components. The config signal starts from the consumer's config and
 * is replaced on every interaction that the menu owns (group and node expansion, field values); every
 * interaction also reaches the consumer through the config callbacks.
 */
@Injectable()
export class PropertiesMenuService {
    readonly activeTabId = signal<string | null>(null);
    readonly config = signal<PropertiesMenuConfig>(new PropertiesMenuConfig({ prefix: '' }));
    readonly selectedTreeNodeId = signal<string | null>(null);
    readonly variables = signal<PropertyVariable[]>([]);

    setConfig(config: PropertiesMenuConfig): void {
        this.config.set(config);
        this.activeTabId.set(config.activeTabId || null);
        this.selectedTreeNodeId.set(this.findActiveTreeNodeId(config));
    }

    setVariables(variables: PropertyVariable[]): void {
        this.variables.set(variables);
    }

    setActiveTab(tabId: string): void {
        const tab = this.config().tabs.find(current => current.id === tabId);

        if (!tab || tab.disabled || this.activeTabId() === tabId) {
            return;
        }

        this.activeTabId.set(tabId);
        this.config().onActiveTabChange?.(tabId);
    }

    selectGroupTab(tabId: string, groupId: string, contentTabId: string): void {
        this.config.update(config =>
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

        this.config().onGroupToggle?.({ expanded, groupId, tabId });
    }

    updateFieldValue(fieldId: string, value: unknown): void {
        const previousValue = this.getField(fieldId)?.value;

        this.config.update(config => this.updateField(config, fieldId, value));

        this.config().onFieldValueChange?.({ fieldId, previousValue, value });
    }

    triggerFieldAction(fieldId: string, key: string, selectionStart: number, selectionEnd: number): void {
        this.config().onFieldAction?.({ fieldId, key, selectionEnd, selectionStart });
    }

    requestAttachmentUpload(fieldId: string, file: File): void {
        this.config().onAttachmentUpload?.({ fieldId, file });
    }

    applyVariableSelection(fieldId: string, variable: PropertyVariable, value: unknown): void {
        this.updateFieldValue(fieldId, value);
        this.config().onVariableSelect?.({ expression: toVariableExpression(variable), fieldId, variable });
    }

    selectTreeNode(tabId: string, groupId: string, nodeId: string): void {
        const node = this.getTreeNode(tabId, groupId, nodeId);

        if (!node || node.disabled) {
            return;
        }

        this.selectedTreeNodeId.set(nodeId);
        this.config().onTreeNodeSelect?.({ groupId, node, nodeId, tabId });
    }

    toggleTreeNode(tabId: string, groupId: string, nodeId: string): void {
        let expanded = false;

        this.config.update(config =>
            this.updateTreeNode(config, tabId, groupId, nodeId, node => {
                expanded = !node.expanded;

                return { ...node, expanded };
            })
        );

        this.config().onTreeNodeToggle?.({ expanded, groupId, nodeId, tabId });
    }

    triggerTreeAddBlock(tabId: string, groupId: string): void {
        this.config().onTreeAddBlock?.({ groupId, tabId });
    }

    triggerTabAdd(tabId: string): void {
        this.config().onTabAdd?.({ tabId });
    }

    removeGroup(tabId: string, groupId: string): void {
        this.config().onGroupRemove?.({ groupId, tabId });
    }

    selectListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled) {
            return;
        }

        this.config().onListItemSelect?.({ groupId, item, itemId, tabId });
    }

    toggleListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled || !item.isExpandable) {
            return;
        }

        const expanded = !item.expanded;

        this.config.update(config =>
            this.updateListItem(config, tabId, groupId, itemId, current => ({ ...current, expanded }))
        );

        this.config().onListItemToggle?.({ expanded, groupId, itemId, tabId });
    }

    triggerListItemAction(tabId: string, groupId: string, itemId: string, key: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled) {
            return;
        }

        this.config().onListItemAction?.({ groupId, itemId, key, tabId });
    }

    removeListItem(tabId: string, groupId: string, itemId: string): void {
        const item = this.getListItem(tabId, groupId, itemId);

        if (!item || item.disabled || !item.removable) {
            return;
        }

        this.config().onListItemRemove?.({ groupId, itemId, tabId });
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
}
