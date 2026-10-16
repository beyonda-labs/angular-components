import { PropertyTreeNode } from './property-tree-node.model';

export class PropertyTreeConfig {
    canAcceptRootDrop: boolean;
    isEmptyStateAddBlockShown: boolean;
    nodes: PropertyTreeNode[];

    addBlockLabel?: string;

    constructor({
        addBlockLabel,
        canAcceptRootDrop = false,
        isEmptyStateAddBlockShown = false,
        nodes = []
    }: PropertyTreeConfigParameters) {
        this.addBlockLabel = addBlockLabel;
        this.canAcceptRootDrop = canAcceptRootDrop;
        this.isEmptyStateAddBlockShown = isEmptyStateAddBlockShown;
        this.nodes = nodes;
    }
}

export interface PropertyTreeConfigParameters {
    addBlockLabel?: string;
    canAcceptRootDrop?: boolean;
    isEmptyStateAddBlockShown?: boolean;
    nodes?: PropertyTreeNode[];
}
