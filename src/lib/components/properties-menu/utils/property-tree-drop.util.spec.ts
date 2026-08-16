import { PropertyTreeNode } from '../models/property-tree-node.model';
import { findTreeNode, isDropAllowed } from './property-tree-drop.util';

function buildTree(): PropertyTreeNode[] {
    return [
        new PropertyTreeNode({
            id: 'section-1',
            acceptsDrop: true,
            draggable: true,
            children: [
                new PropertyTreeNode({ id: 'band', dropDisabled: true }),
                new PropertyTreeNode({
                    id: 'list',
                    acceptsDrop: true,
                    draggable: true,
                    children: [new PropertyTreeNode({ id: 'nested', draggable: true })]
                }),
                new PropertyTreeNode({ id: 'image', draggable: true })
            ]
        }),
        new PropertyTreeNode({ id: 'section-2', acceptsDrop: true, draggable: true })
    ];
}

describe('property-tree-drop.util', () => {
    describe('findTreeNode', () => {
        it('should find a nested node', () => {
            expect(findTreeNode(buildTree(), 'nested')?.id).toBe('nested');
        });

        it('should return undefined for an unknown id', () => {
            expect(findTreeNode(buildTree(), 'missing')).toBeUndefined();
        });
    });

    describe('isDropAllowed', () => {
        it('should reject dropping a node onto itself', () => {
            expect(isDropAllowed(buildTree(), 'list', 'list', 'inside', false)).toBe(false);
        });

        it('should reject dropping a node inside its own descendant', () => {
            expect(isDropAllowed(buildTree(), 'list', 'nested', 'inside', false)).toBe(false);
        });

        it('should reject dropping a node next to its own descendant', () => {
            expect(isDropAllowed(buildTree(), 'list', 'nested', 'before', false)).toBe(false);
        });

        it('should accept dropping inside a node that accepts it', () => {
            expect(isDropAllowed(buildTree(), 'image', 'list', 'inside', false)).toBe(true);
        });

        it('should reject dropping inside a node that does not accept it', () => {
            expect(isDropAllowed(buildTree(), 'list', 'image', 'inside', false)).toBe(false);
        });

        it('should resolve a sibling drop through the parent of the target', () => {
            expect(isDropAllowed(buildTree(), 'nested', 'image', 'after', false)).toBe(true);
        });

        it('should reject any drop involving a node marked as dropDisabled', () => {
            expect(isDropAllowed(buildTree(), 'image', 'band', 'inside', false)).toBe(false);
            expect(isDropAllowed(buildTree(), 'image', 'band', 'before', false)).toBe(false);
        });

        it('should reject a root sibling drop when the root does not accept it', () => {
            expect(isDropAllowed(buildTree(), 'image', 'section-2', 'before', false)).toBe(false);
        });

        it('should accept a root sibling drop when the root accepts it', () => {
            expect(isDropAllowed(buildTree(), 'section-2', 'section-1', 'before', true)).toBe(true);
        });

        it('should reject an unknown node id', () => {
            expect(isDropAllowed(buildTree(), 'missing', 'list', 'inside', false)).toBe(false);
            expect(isDropAllowed(buildTree(), 'image', 'missing', 'inside', false)).toBe(false);
        });
    });
});
