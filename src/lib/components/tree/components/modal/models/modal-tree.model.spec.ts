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

        expect(config.getTitle()).toBe('test.move.title');
    });

    it('should keep the provided title', () => {
        const config = buildConfig({ title: 'custom.title' });

        expect(config.getTitle()).toBe('custom.title');
    });

    it('should report no selection until a node is selected', () => {
        const config = buildConfig();

        expect(config.hasSelection()).toBe(false);

        config.treeConfig.onNodeSelect?.(config.treeConfig.nodes[1]);

        expect(config.hasSelection()).toBe(true);
    });

    it('should find the selected node anywhere in the tree, including nested levels', () => {
        const config = buildConfig();
        const nested = config.treeConfig.nodes[1].children[0];

        config.treeConfig.onNodeSelect?.(nested);

        expect(config.getSelectedNode()).toBe(nested);
    });

    it('should call the consumer onConfirm with the currently selected node', () => {
        const onConfirm = jest.fn();
        const config = buildConfig({ onConfirm });
        const root = config.treeConfig.nodes[0];

        config.treeConfig.onNodeSelect?.(root);
        config.confirm();

        expect(onConfirm).toHaveBeenCalledWith(root);
    });

    it('should close through the close handler', () => {
        const closeHandler = jest.fn();
        const config = buildConfig();

        config.closeHandler = closeHandler;
        config.close();

        expect(closeHandler).toHaveBeenCalled();
    });
});

function buildConfig(overrides?: {
    expandedKeys?: string[];
    onConfirm?: (node: TreeNode | undefined) => void;
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
