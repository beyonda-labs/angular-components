import { TreeNode } from './tree.model';

export function collectExpandableKeys<TData>(nodes: TreeNode<TData>[]): string[] {
    const keys: string[] = [];

    for (const node of nodes) {
        if (node.children.length > 0) {
            keys.push(node.key, ...collectExpandableKeys(node.children));
        }
    }

    return keys;
}

export function findNodeByKey<TData>(nodes: TreeNode<TData>[], key?: string): TreeNode<TData> | undefined {
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
