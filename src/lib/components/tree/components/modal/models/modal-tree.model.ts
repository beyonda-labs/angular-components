import { TreeConfig, TreeNode } from '../../../models/tree.model';

export enum ModalTreeSize {
    Small = 'modal-sm',
    Medium = '',
    Large = 'modal-lg'
}

export class ModalTreeConfig<TData = unknown> {
    readonly prefix: string;
    readonly treeConfig: TreeConfig<TData>;
    size: ModalTreeSize;
    title?: string;

    closeHandler?: () => void;

    private readonly onConfirm?: (node: TreeNode<TData> | undefined) => void;

    constructor({
        expandedKeys,
        nodes,
        onConfirm,
        prefix,
        selectedKey,
        size,
        title
    }: ModalTreeConfigParameters<TData>) {
        this.onConfirm = onConfirm;
        this.prefix = prefix;
        this.size = size ?? ModalTreeSize.Medium;
        this.title = title;
        this.treeConfig = new TreeConfig({
            nodes,
            prefix: `${prefix}.nodes`,
            selectedKey,
            expandedKeys: expandedKeys ?? collectExpandableKeys(nodes),
            onNodeSelect: node => (this.treeConfig.selectedKey = node.key)
        });
    }

    close(): void {
        this.closeHandler?.();
    }

    confirm(): void {
        this.onConfirm?.(this.getSelectedNode());
    }

    getSelectedNode(): TreeNode<TData> | undefined {
        return findNodeByKey(this.treeConfig.nodes, this.treeConfig.selectedKey);
    }

    getTitle(): string {
        return this.title ?? `${this.prefix}.title`;
    }

    hasSelection(): boolean {
        return Boolean(this.treeConfig.selectedKey);
    }
}

export interface ModalTreeConfigParameters<TData = unknown> {
    nodes: TreeNode<TData>[];
    prefix: string;

    expandedKeys?: string[];
    onConfirm?: (node: TreeNode<TData> | undefined) => void;
    selectedKey?: string;
    size?: ModalTreeSize;
    title?: string;
}

function collectExpandableKeys<TData>(nodes: TreeNode<TData>[]): string[] {
    const keys: string[] = [];

    for (const node of nodes) {
        if (node.children.length > 0) {
            keys.push(node.key, ...collectExpandableKeys(node.children));
        }
    }

    return keys;
}

function findNodeByKey<TData>(nodes: TreeNode<TData>[], key: string | undefined): TreeNode<TData> | undefined {
    if (!key) {
        return undefined;
    }

    for (const node of nodes) {
        if (node.key === key) {
            return node;
        }

        const found = findNodeByKey(node.children, key);

        if (found) {
            return found;
        }
    }

    return undefined;
}
