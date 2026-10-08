import { PropertyTreeNode } from './property-tree-node.model';

export class PropertyTreeConfig {
    acceptsRootDrop: boolean;
    nodes: PropertyTreeNode[];
    showEmptyStateAddBlock: boolean;

    addBlockLabel?: string;

    constructor({
        acceptsRootDrop = false,
        addBlockLabel,
        nodes = [],
        showEmptyStateAddBlock = false
    }: PropertyTreeConfigParameters) {
        this.acceptsRootDrop = acceptsRootDrop;
        this.addBlockLabel = addBlockLabel;
        this.nodes = nodes;
        this.showEmptyStateAddBlock = showEmptyStateAddBlock;
    }
}

export interface PropertyTreeConfigParameters {
    acceptsRootDrop?: boolean;
    addBlockLabel?: string;
    nodes?: PropertyTreeNode[];
    showEmptyStateAddBlock?: boolean;
}
