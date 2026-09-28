import { TestBed } from '@angular/core/testing';

import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from '../models/properties-menu-config.model';
import { PropertyTreeDrop } from '../models/properties-menu-events.model';
import { PropertyTreeNode } from '../models/property-tree-node.model';
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

    it('reports the drag as active once started', () => {
        expect(service.dragging()).toBe(false);

        service.start('structure', 'tree', node);

        expect(service.dragging()).toBe(true);
        expect(service.dragNodeId()).toBe('image');
    });

    it('reports the drag start to the config', () => {
        const onTreeDragStart = jest.fn();

        configure({ onTreeDragStart });
        service.start('structure', 'tree', node);

        expect(onTreeDragStart).toHaveBeenCalledWith({ groupId: 'tree', node, nodeId: 'image', tabId: 'structure' });
    });

    it('reports the drop on a valid target', () => {
        const drops: PropertyTreeDrop[] = [];

        configure({ onTreeDrop: event => drops.push(event) });
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: true });
        service.drop('structure', 'tree');

        expect(drops).toEqual([
            { groupId: 'tree', nodeId: 'image', position: 'inside', tabId: 'structure', targetNodeId: 'list' }
        ]);
    });

    it('does not report the drop on an invalid target', () => {
        const onTreeDrop = jest.fn();

        configure({ onTreeDrop });
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: false });
        service.drop('structure', 'tree');

        expect(onTreeDrop).not.toHaveBeenCalled();
    });

    it('ends the drag after the drop', () => {
        const onTreeDragEnd = jest.fn();

        configure({ onTreeDragEnd });
        service.start('structure', 'tree', node);
        service.drop('structure', 'tree');

        expect(service.dragging()).toBe(false);
        expect(onTreeDragEnd).toHaveBeenCalledWith({ groupId: 'tree', tabId: 'structure' });
    });

    it('ignores a cancel while no drag is active', () => {
        const onTreeDragEnd = jest.fn();

        configure({ onTreeDragEnd });
        service.cancel('structure', 'tree');

        expect(onTreeDragEnd).not.toHaveBeenCalled();
    });

    it('exposes the drop position for the valid target row only', () => {
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'after', valid: true });

        expect(service.dropPositionFor('list')).toBe('after');
        expect(service.dropPositionFor('other')).toBeNull();
        expect(service.isInvalidTarget('list')).toBe(false);
    });

    it('exposes the invalid target row', () => {
        service.start('structure', 'tree', node);
        service.setDropTarget({ nodeId: 'list', position: 'inside', valid: false });

        expect(service.dropPositionFor('list')).toBeNull();
        expect(service.isInvalidTarget('list')).toBe(true);
    });
});
