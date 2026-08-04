import { PropertyTreeNode } from './property-tree-node.model';

describe('PropertyTreeNode', () => {
    it('should apply default values', () => {
        const node = new PropertyTreeNode({ id: 'page-1', label: 'Página 1' });

        expect(node.active).toBe(false);
        expect(node.disabled).toBe(false);
        expect(node.expanded).toBe(true);
        expect(node.hidden).toBe(false);
        expect(node.children).toEqual([]);
    });

    it('should allow marking a node active', () => {
        const node = new PropertyTreeNode({ id: 'page-1', active: true });

        expect(node.active).toBe(true);
    });

    it('should default the label to a translation key sentinel based on the id', () => {
        const node = new PropertyTreeNode({ id: 'page-1' });

        expect(node.label).toBe('page-1.label');
    });

    it('should transform nested children into PropertyTreeNode instances', () => {
        const node = new PropertyTreeNode({
            id: 'header',
            label: 'Encabezado',
            children: [new PropertyTreeNode({ id: 'header-image', label: 'Imagen' })]
        });

        expect(node.children[0]).toBeInstanceOf(PropertyTreeNode);
        expect(node.children[0].label).toBe('Imagen');
    });

    it('should reuse PropertyTreeNode instances instead of rebuilding them', () => {
        const child = new PropertyTreeNode({ id: 'header-image', label: 'Imagen' });
        const node = new PropertyTreeNode({ id: 'header', label: 'Encabezado', children: [child] });

        expect(node.children[0]).toBe(child);
    });
});
