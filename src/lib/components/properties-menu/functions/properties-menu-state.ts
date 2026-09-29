import { PropertiesMenuConfig } from './properties-menu-config.model';
import { PropertyGroup } from './property-group.model';
import {
    PropertyGroupContent,
    PropertyGroupContentType,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from './property-group-content.model';
import { PropertyListItem } from './property-list-item.model';
import { PropertyTab } from './property-tab.model';
import { PropertyTreeConfig } from './property-tree-config.model';
import { PropertyTreeNode } from './property-tree-node.model';

export interface PropertiesMenuState {
    activeTabId: string | null;
    config: PropertiesMenuConfig;
    selectedTreeNodeId: string | null;
}

interface OpenState {
    contentTabs: Map<string, string>;
    groups: Map<string, boolean>;
    listItems: Map<string, boolean>;
    treeNodes: Map<string, boolean>;
}

interface StateSources {
    current: OpenState;
    previous: OpenState;
    revealed: Set<string>;
}

export function keepPropertiesMenuState(
    previous: PropertiesMenuConfig | null,
    current: PropertiesMenuState,
    next: PropertiesMenuConfig
): PropertiesMenuState {
    const selectedTreeNodeId = keepSelectedTreeNodeId(previous, current.selectedTreeNodeId, next);
    const isNewSelection = selectedTreeNodeId !== null && selectedTreeNodeId !== current.selectedTreeNodeId;
    const sources: StateSources = {
        current: readOpenState(current.config),
        previous: readOpenState(previous),
        revealed: isNewSelection ? findAncestorKeys(next, selectedTreeNodeId) : new Set()
    };
    const tabs = next.tabs.map(tab => keepTab(tab, sources));

    return {
        activeTabId: keepActiveTabId(previous, current.activeTabId, next),
        config: isSameList(tabs, next.tabs) ? next : new PropertiesMenuConfig({ ...next, tabs }),
        selectedTreeNodeId
    };
}

function findActiveNodeId(nodes: PropertyTreeNode[]): string | null {
    for (const node of nodes) {
        if (node.active) {
            return node.id;
        }

        const found = findActiveNodeId(node.children);

        if (found) {
            return found;
        }
    }

    return null;
}

function findActiveTreeNodeId(config: PropertiesMenuConfig): string | null {
    for (const tab of config.tabs) {
        for (const group of tab.groups) {
            const found =
                group.content.type === PropertyGroupContentType.TREE
                    ? findActiveNodeId(group.content.tree.nodes)
                    : null;

            if (found) {
                return found;
            }
        }
    }

    return null;
}

function findAncestorIds(nodes: PropertyTreeNode[], nodeId: string, path: string[] = []): string[] | undefined {
    for (const node of nodes) {
        if (node.id === nodeId) {
            return path;
        }

        const found = findAncestorIds(node.children, nodeId, [...path, node.id]);

        if (found) {
            return found;
        }
    }

    return undefined;
}

function findAncestorKeys(config: PropertiesMenuConfig, nodeId: string): Set<string> {
    for (const tab of config.tabs) {
        for (const group of tab.groups) {
            const ancestorIds =
                group.content.type === PropertyGroupContentType.TREE
                    ? findAncestorIds(group.content.tree.nodes, nodeId)
                    : undefined;

            if (ancestorIds) {
                const groupKey = toStateKey(tab.id, group.id);

                return new Set(ancestorIds.map(id => toStateKey(groupKey, id)));
            }
        }
    }

    return new Set();
}

function hasTreeNode(config: PropertiesMenuConfig, nodeId: string): boolean {
    return config.tabs.some(tab =>
        tab.groups.some(
            group =>
                group.content.type === PropertyGroupContentType.TREE &&
                findAncestorIds(group.content.tree.nodes, nodeId) !== undefined
        )
    );
}

function isSameList<T>(first: T[], second: T[]): boolean {
    return first.length === second.length && first.every((item, index) => item === second[index]);
}

function keepActiveTabId(
    previous: PropertiesMenuConfig | null,
    current: string | null,
    next: PropertiesMenuConfig
): string | null {
    const isKept =
        previous?.activeTabId === next.activeTabId && next.tabs.some(tab => tab.id === current && !tab.hidden);

    return isKept ? current : next.activeTabId || null;
}

function keepContent(groupKey: string, content: PropertyGroupContent, sources: StateSources): PropertyGroupContent {
    switch (content.type) {
        case PropertyGroupContentType.LIST:
            return keepListContent(groupKey, content, sources);
        case PropertyGroupContentType.TABS:
            return keepTabsContent(groupKey, content, sources);
        case PropertyGroupContentType.TREE:
            return keepTreeContent(groupKey, content, sources);
        default:
            return content;
    }
}

function keepGroup(tabId: string, group: PropertyGroup, sources: StateSources): PropertyGroup {
    const groupKey = toStateKey(tabId, group.id);
    const content = keepContent(groupKey, group.content, sources);
    const expanded = keepValue(groupKey, group.expanded, sources.previous.groups, sources.current.groups);

    return content === group.content && expanded === group.expanded
        ? group
        : new PropertyGroup({ ...group, content, expanded });
}

function keepListContent(groupKey: string, content: PropertyListContent, sources: StateSources): PropertyListContent {
    const list = content.list.map(item => {
        const itemKey = toStateKey(groupKey, item.id);
        const expanded = keepValue(itemKey, item.expanded, sources.previous.listItems, sources.current.listItems);

        return expanded === item.expanded ? item : new PropertyListItem({ ...item, expanded });
    });

    return isSameList(list, content.list) ? content : new PropertyListContent({ list });
}

function keepSelectedTreeNodeId(
    previous: PropertiesMenuConfig | null,
    current: string | null,
    next: PropertiesMenuConfig
): string | null {
    const nextActiveId = findActiveTreeNodeId(next);
    const isKept =
        previous !== null &&
        current !== null &&
        findActiveTreeNodeId(previous) === nextActiveId &&
        hasTreeNode(next, current);

    return isKept ? current : nextActiveId;
}

function keepTab(tab: PropertyTab, sources: StateSources): PropertyTab {
    const groups = tab.groups.map(group => keepGroup(tab.id, group, sources));

    return isSameList(groups, tab.groups) ? tab : new PropertyTab({ ...tab, groups });
}

function keepTabsContent(groupKey: string, content: PropertyTabsContent, sources: StateSources): PropertyTabsContent {
    const kept = keepValue(groupKey, content.activeTabId, sources.previous.contentTabs, sources.current.contentTabs);
    const activeTabId = content.tabs.some(tab => tab.id === kept) ? kept : content.activeTabId;

    return activeTabId === content.activeTabId ? content : new PropertyTabsContent({ ...content, activeTabId });
}

function keepTreeContent(groupKey: string, content: PropertyTreeContent, sources: StateSources): PropertyTreeContent {
    const nodes = keepTreeNodes(groupKey, content.tree.nodes, sources);

    return isSameList(nodes, content.tree.nodes)
        ? content
        : new PropertyTreeContent({ tree: new PropertyTreeConfig({ ...content.tree, nodes }) });
}

function keepTreeNodes(groupKey: string, nodes: PropertyTreeNode[], sources: StateSources): PropertyTreeNode[] {
    return nodes.map(node => {
        const nodeKey = toStateKey(groupKey, node.id);
        const children = keepTreeNodes(groupKey, node.children, sources);
        const expanded =
            sources.revealed.has(nodeKey) ||
            keepValue(nodeKey, node.expanded, sources.previous.treeNodes, sources.current.treeNodes);

        return expanded === node.expanded && isSameList(children, node.children)
            ? node
            : new PropertyTreeNode({ ...node, children, expanded });
    });
}

function keepValue<T>(key: string, next: T, previous: Map<string, T>, current: Map<string, T>): T {
    const kept = current.get(key);

    return kept !== undefined && previous.get(key) === next ? kept : next;
}

function readContentState(state: OpenState, groupKey: string, content: PropertyGroupContent): void {
    switch (content.type) {
        case PropertyGroupContentType.LIST:
            content.list.forEach(item => state.listItems.set(toStateKey(groupKey, item.id), item.expanded));
            break;
        case PropertyGroupContentType.TABS:
            state.contentTabs.set(groupKey, content.activeTabId);
            break;
        case PropertyGroupContentType.TREE:
            readTreeNodes(state.treeNodes, groupKey, content.tree.nodes);
            break;
        default:
            break;
    }
}

function readOpenState(config: PropertiesMenuConfig | null): OpenState {
    const state: OpenState = { contentTabs: new Map(), groups: new Map(), listItems: new Map(), treeNodes: new Map() };

    config?.tabs.forEach(tab =>
        tab.groups.forEach(group => {
            const groupKey = toStateKey(tab.id, group.id);

            state.groups.set(groupKey, group.expanded);
            readContentState(state, groupKey, group.content);
        })
    );

    return state;
}

function readTreeNodes(treeNodes: Map<string, boolean>, groupKey: string, nodes: PropertyTreeNode[]): void {
    nodes.forEach(node => {
        treeNodes.set(toStateKey(groupKey, node.id), node.expanded);
        readTreeNodes(treeNodes, groupKey, node.children);
    });
}

function toStateKey(...ids: string[]): string {
    return JSON.stringify(ids);
}
