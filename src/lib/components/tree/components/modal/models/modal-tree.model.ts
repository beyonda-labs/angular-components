import { TreeConfig, TreeNode } from '../../../models/tree.model';
import { collectExpandableKeys, findNodeByKey } from '../../../models/tree-node-search';

export enum ModalTreeSize {
    Large = 'modal-lg',
    Medium = '',
    Small = 'modal-sm'
}

export class ModalTreeConfig<TData = unknown> {
    readonly prefix: string;
    size: ModalTreeSize;
    readonly treeConfig: TreeConfig<TData>;

    closeHandler?: () => void;
    private readonly onConfirm?: (node: TreeNode<TData> | undefined) => void;
    title?: string;

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
