import { TestBed } from '@angular/core/testing';

import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from '../models/properties-menu-config.model';
import { PropertyTreeNode } from '../models/property-tree-node.model';
import { PropertyTreeDrop } from '../types/properties-menu-events';
import { PropertiesMenuService } from './properties-menu.service';
import { PropertyTreeDragService } from './property-tree-drag.service';

describe('PropertyTreeDragService', () => {
    let service: PropertyTreeDragService;
    let node: PropertyTreeNode;

    function configure(callbacks: Partial<PropertiesMenuConfigParameters>): void {
        TestBed.inject(PropertiesMenuService).setConfig(new PropertiesMenuConfig({ prefix: 'app', ...callbacks }));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PropertiesMenuService, PropertyTreeDragService] });
        service = TestBed.inject(PropertyTreeDragService);
        node = new PropertyTreeNode({ draggable: true, id: 'image' });
    });

    it('should report the drag as active once started', () => {
        expect(service.dragging()).toBe(false);

        service.start('structure', 'tree', node);

        expect(service.dragging()).toBe(true);
        expect(service.dragNodeId()).toBe('image');
    });

    it('should report the drag start to the config', () => {
        const onTreeDragStart = jest.fn();

        configure({ onTreeDragStart });
        service.start('structure', 'tree', node);

        expect(onTreeDragStart).toHaveBeenCalledWith({ groupId: 'tree', node, nodeId: 'image', tabId: 'structure' });
    });

    it('should report the drop when the target is valid', () => {
        const drops: PropertyTreeDrop[] = [];

        configure({ onTreeDrop: event => drops.push(event) });
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: true });
        service.drop('structure', 'tree');

        expect(drops).toEqual([
            { groupId: 'tree', nodeId: 'image', position: 'inside', tabId: 'structure', targetNodeId: 'list' }
        ]);
    });

    it('should not report the drop when the target is invalid', () => {
        const onTreeDrop = jest.fn();

        configure({ onTreeDrop });
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: false });
        service.drop('structure', 'tree');

        expect(onTreeDrop).not.toHaveBeenCalled();
    });

    it('should end the drag after dropping', () => {
        const onTreeDragEnd = jest.fn();

        configure({ onTreeDragEnd });
        service.start('structure', 'tree', node);
        service.drop('structure', 'tree');

        expect(service.dragging()).toBe(false);
        expect(onTreeDragEnd).toHaveBeenCalledWith({ groupId: 'tree', tabId: 'structure' });
    });

    it('should ignore a cancel when no drag is active', () => {
        const onTreeDragEnd = jest.fn();

        configure({ onTreeDragEnd });
        service.cancel('structure', 'tree');

        expect(onTreeDragEnd).not.toHaveBeenCalled();
    });

    it('should expose the drop position only for the valid target row', () => {
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'after', valid: true });

        expect(service.dropPositionFor('list')).toBe('after');
        expect(service.dropPositionFor('other')).toBeNull();
        expect(service.isInvalidTarget('list')).toBe(false);
    });

    it('should expose the invalid target row', () => {
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: false });

        expect(service.dropPositionFor('list')).toBeNull();
        expect(service.isInvalidTarget('list')).toBe(true);
    });
});
