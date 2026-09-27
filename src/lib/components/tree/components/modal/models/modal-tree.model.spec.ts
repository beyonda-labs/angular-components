import { TreeNode } from '../../../models/tree.model';
import { ModalTreeConfig, ModalTreeSize } from './modal-tree.model';

describe('ModalTreeConfig', () => {
    it('should expand every node that has children by default, so the full hierarchy is visible upfront', () => {
        const config = buildConfig();

        expect(config.treeConfig.expandedKeys).toEqual(['folder-1', 'sub-folder-1']);
    });

    it('should keep an explicit expandedKeys override instead of computing one', () => {
        const config = buildConfig({ expandedKeys: [] });

        expect(config.treeConfig.expandedKeys).toEqual([]);
    });

    it('should default the size to medium', () => {
        const config = buildConfig();

        expect(config.size).toBe(ModalTreeSize.Medium);
    });

    it('should keep the provided size', () => {
        const config = buildConfig({ size: ModalTreeSize.Large });

        expect(config.size).toBe(ModalTreeSize.Large);
    });

    it('should build the title key from the prefix when no title is provided', () => {
        const config = buildConfig();

        expect(config.title).toBe('test.move.title');
    });

    it('should keep the provided title', () => {
        const config = buildConfig({ title: 'custom.title' });

        expect(config.title).toBe('custom.title');
    });

    it('should hand the initial selection and the node prefix to the tree', () => {
        const config = buildConfig({ selectedKey: 'leaf-1' });

        expect(config.treeConfig.selectedKey).toBe('leaf-1');
        expect(config.treeConfig.prefix).toBe('test.move.nodes');
    });
});

function buildConfig(overrides?: {
    expandedKeys?: string[];
    selectedKey?: string;
    size?: ModalTreeSize;
    title?: string;
}): ModalTreeConfig {
    return new ModalTreeConfig({
        nodes: [
            new TreeNode({ key: 'root', label: 'Root' }),
            new TreeNode({
                key: 'folder-1',
                label: 'Folder 1',
                children: [
                    new TreeNode({
                        key: 'sub-folder-1',
                        label: 'Sub-folder 1',
                        children: [new TreeNode({ key: 'leaf-1', label: 'Leaf 1' })]
                    })
                ]
            })
        ],
        prefix: 'test.move',
        ...overrides
    });
}
