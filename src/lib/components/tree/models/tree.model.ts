import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class TreeNode<TData = unknown> {
    children: TreeNode<TData>[];
    key: string;
    label: string;

    data?: TData;
    icon?: IconDefinition;
    isDisabled: boolean;

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

export interface TreeNodeParameters<TData = unknown> {
    key: string;

    children?: TreeNode<TData>[];
    data?: TData;
    icon?: IconDefinition;
    isDisabled?: boolean;
    label?: string;
}

export class TreeConfig<TData = unknown> {
    nodes: TreeNode<TData>[];
    prefix: string;

    /** Keys expanded on init; expand/collapse state afterwards is managed internally. */
    expandedKeys?: string[];
    onNodeSelect?: (node: TreeNode<TData>) => void;
    onNodeToggle?: (node: TreeNode<TData>, expanded: boolean) => void;
    /** Key of the currently selected node, controlled by the consumer (like a controlled input). */
    selectedKey?: string;

    constructor({
        nodes,
        prefix,
        expandedKeys,
        onNodeSelect,
        onNodeToggle,
        selectedKey
    }: TreeConfigParameters<TData>) {
        this.expandedKeys = expandedKeys;
        this.nodes = nodes;
        this.onNodeSelect = onNodeSelect;
        this.onNodeToggle = onNodeToggle;
        this.prefix = prefix;
        this.selectedKey = selectedKey;
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
