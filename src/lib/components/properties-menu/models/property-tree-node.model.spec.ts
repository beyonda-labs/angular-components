import { PropertyTreeNode } from './property-tree-node.model';

describe('PropertyTreeNode', () => {
    it('applies the defaults', () => {
        const node = new PropertyTreeNode({ id: 'page-1', label: 'Página 1' });

        expect(node.active).toBe(false);
        expect(node.disabled).toBe(false);
        expect(node.expanded).toBe(true);
        expect(node.hidden).toBe(false);
        expect(node.children).toEqual([]);
    });

    it('can be marked active', () => {
        const node = new PropertyTreeNode({ id: 'page-1', active: true });

        expect(node.active).toBe(true);
    });

    it('defaults the label to the key sentinel of its id', () => {
        const node = new PropertyTreeNode({ id: 'page-1' });

        expect(node.label).toBe('page-1.label');
    });

    it('turns nested children into PropertyTreeNode instances', () => {
        const node = new PropertyTreeNode({
            id: 'header',
            label: 'Encabezado',
            children: [new PropertyTreeNode({ id: 'header-image', label: 'Imagen' })]
        });

        expect(node.children[0]).toBeInstanceOf(PropertyTreeNode);
        expect(node.children[0].label).toBe('Imagen');
    });

    it('reuses the PropertyTreeNode instances it is given instead of rebuilding them', () => {
        const child = new PropertyTreeNode({ id: 'header-image', label: 'Imagen' });
        const node = new PropertyTreeNode({ id: 'header', label: 'Encabezado', children: [child] });

        expect(node.children[0]).toBe(child);
    });
});
