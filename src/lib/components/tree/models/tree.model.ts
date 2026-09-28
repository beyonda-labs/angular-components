import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class TreeConfig<TData = unknown> {
    nodes: TreeNode<TData>[];
    prefix: string;

    expandedKeys?: string[];
    onNodeSelect?: (node: TreeNode<TData>) => void;
    onNodeToggle?: (node: TreeNode<TData>, expanded: boolean) => void;
    selectedKey?: string;

    constructor({ nodes, prefix, expandedKeys, onNodeSelect, onNodeToggle, selectedKey }: TreeConfigParameters<TData>) {
        this.expandedKeys = expandedKeys;
        this.nodes = nodes;
        this.onNodeSelect = onNodeSelect;
        this.onNodeToggle = onNodeToggle;
        this.prefix = prefix;
        this.selectedKey = selectedKey;
    }
}

export class TreeNode<TData = unknown> {
    children: TreeNode<TData>[];
    isDisabled: boolean;
    key: string;
    label: string;

    data?: TData;
    icon?: IconDefinition;

    constructor({
        key,
        children = [],
        data,
        icon,
        isDisabled = false,
        label = `${key}.label`
    }: TreeNodeParameters<TData>) {
        this.children = children;
        this.data = data;
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.key = key;
        this.label = label;
    }
}

export interface TreeConfigParameters<TData = unknown> {
    nodes: TreeNode<TData>[];
    prefix: string;

    expandedKeys?: string[];
    onNodeSelect?: (node: TreeNode<TData>) => void;
    onNodeToggle?: (node: TreeNode<TData>, expanded: boolean) => void;
    selectedKey?: string;
}

export interface TreeNodeParameters<TData = unknown> {
    key: string;

    children?: TreeNode<TData>[];
    data?: TData;
    icon?: IconDefinition;
    isDisabled?: boolean;
    label?: string;
}
