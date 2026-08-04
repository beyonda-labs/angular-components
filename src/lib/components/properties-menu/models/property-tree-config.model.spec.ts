import { PropertyTreeConfig } from './property-tree-config.model';
import { PropertyTreeNode } from './property-tree-node.model';

describe('PropertyTreeConfig', () => {
    it('should apply default values', () => {
        const config = new PropertyTreeConfig({});

        expect(config.nodes).toEqual([]);
        expect(config.addBlockLabel).toBeUndefined();
        expect(config.showEmptyStateAddBlock).toBe(false);
    });

    it('should transform node configs into PropertyTreeNode instances', () => {
        const config = new PropertyTreeConfig({ nodes: [new PropertyTreeNode({ id: 'page-1' })] });

        expect(config.nodes[0]).toBeInstanceOf(PropertyTreeNode);
    });

    it('should keep already-instantiated PropertyTreeNode instances as-is', () => {
        const node = new PropertyTreeNode({ id: 'page-1' });
        const config = new PropertyTreeConfig({ nodes: [node] });

        expect(config.nodes[0]).toBe(node);
    });

    it('should apply addBlockLabel and showEmptyStateAddBlock overrides', () => {
        const config = new PropertyTreeConfig({ addBlockLabel: 'add.label', showEmptyStateAddBlock: true });

        expect(config.addBlockLabel).toBe('add.label');
        expect(config.showEmptyStateAddBlock).toBe(true);
    });
});
