import { PropertyTreeNode } from './property-tree-node.model';

export interface PropertyTreeConfigParameters {
    addBlockLabel?: string;
    nodes?: PropertyTreeNode[];
    showEmptyStateAddBlock?: boolean;
}

export class PropertyTreeConfig {
    nodes: PropertyTreeNode[];
    showEmptyStateAddBlock: boolean;

    addBlockLabel?: string;

    constructor({ addBlockLabel, nodes = [], showEmptyStateAddBlock = false }: PropertyTreeConfigParameters) {
        this.addBlockLabel = addBlockLabel;
        this.nodes = nodes;
        this.showEmptyStateAddBlock = showEmptyStateAddBlock;
    }
}
