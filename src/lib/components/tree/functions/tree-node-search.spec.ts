import { TreeNode } from '../models/tree.model';
import { collectExpandableKeys, findNodeByKey } from './tree-node-search';

describe('tree-node-search', () => {
    function buildNodes(): TreeNode[] {
        return [
            new TreeNode({
                key: 'documents',
                children: [
                    new TreeNode({ key: 'invoices', children: [new TreeNode({ key: 'march' })] }),
                    new TreeNode({ key: 'notes' })
                ]
            }),
            new TreeNode({ key: 'trash' })
        ];
    }

    describe('collectExpandableKeys', () => {
        it('lists every node that has children, at any depth', () => {
            expect(collectExpandableKeys(buildNodes())).toEqual(['documents', 'invoices']);
        });
    });

    describe('findNodeByKey', () => {
        it('finds a node nested at any depth', () => {
            expect(findNodeByKey(buildNodes(), 'march')?.key).toBe('march');
        });

        it('returns undefined for a missing key or no key at all', () => {
            expect(findNodeByKey(buildNodes(), 'unknown')).toBeUndefined();
            expect(findNodeByKey(buildNodes())).toBeUndefined();
        });
    });
});
