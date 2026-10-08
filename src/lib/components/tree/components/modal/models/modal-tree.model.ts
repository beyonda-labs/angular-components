import { collectExpandableKeys } from '../../../functions/tree-node-search';
import { TreeConfig, TreeNode } from '../../../models/tree.model';

export enum ModalTreeSize {
    Large = 'modal-lg',
    Medium = '',
    Small = 'modal-sm'
}

export class ModalTreeConfig<TData = unknown> {
    prefix: string;
    size: ModalTreeSize;
    title: string;
    treeConfig: TreeConfig<TData>;

    onConfirm?: (node: TreeNode<TData> | undefined) => void;

    constructor({
        expandedKeys,
        nodes,
        onConfirm,
        prefix,
        selectedKey,
        size = ModalTreeSize.Medium,
        title = `${prefix}.title`
    }: ModalTreeConfigParameters<TData>) {
        this.onConfirm = onConfirm;
        this.prefix = prefix;
        this.size = size;
        this.title = title;
        this.treeConfig = new TreeConfig({
            expandedKeys: expandedKeys ?? collectExpandableKeys(nodes),
            nodes,
            prefix: `${prefix}.nodes`,
            selectedKey
        });
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
