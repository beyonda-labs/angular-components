import { PropertyTreeNode } from '../models/property-tree-node.model';

export type PropertyTreeDropPosition = 'after' | 'before' | 'inside';

interface NodeLookup {
    node: PropertyTreeNode;
    parent: PropertyTreeNode | null;
}

export function findTreeNode(nodes: PropertyTreeNode[], nodeId: string): PropertyTreeNode | undefined {
    return lookupTreeNode(nodes, nodeId)?.node;
}

export function isDropAllowed(
    nodes: PropertyTreeNode[],
    dragNodeId: string,
    targetNodeId: string,
    position: PropertyTreeDropPosition,
    acceptsRootDrop: boolean
): boolean {
    if (dragNodeId === targetNodeId) {
        return false;
    }

    const dragged = lookupTreeNode(nodes, dragNodeId);
    const target = lookupTreeNode(nodes, targetNodeId);

    if (!dragged || !target || target.node.dropDisabled) {
        return false;
    }

    const container = position === 'inside' ? target.node : target.parent;

    if (container !== null && (container === dragged.node || isDescendantNode(dragged.node, container))) {
        return false;
    }

    return container === null ? acceptsRootDrop : container.acceptsDrop && !container.dropDisabled;
}

function isDescendantNode(ancestor: PropertyTreeNode, node: PropertyTreeNode): boolean {
    return ancestor.children.some(child => child === node || isDescendantNode(child, node));
}

function lookupTreeNode(
    nodes: PropertyTreeNode[],
    nodeId: string,
    parent: PropertyTreeNode | null = null
): NodeLookup | undefined {
    for (const node of nodes) {
        if (node.id === nodeId) {
            return { node, parent };
        }

        const found = lookupTreeNode(node.children, nodeId, node);

        if (found) {
            return found;
        }
    }

    return undefined;
}
