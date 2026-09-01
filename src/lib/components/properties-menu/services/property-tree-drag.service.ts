import { Injectable, signal } from '@angular/core';

import { PropertyTreeNode } from '../models/property-tree-node.model';
import {
    PropertyTreeDragEnd,
    PropertyTreeDragStart,
    PropertyTreeDrop
} from '../types/properties-menu-events';
import { PropertyTreeDropPosition } from '../utils/property-tree-drop.util';

interface DropTarget {
    nodeId: string;
    position: PropertyTreeDropPosition;
    valid: boolean;
}

@Injectable()
export class PropertyTreeDragService {
    readonly dragNodeId = signal<string | null>(null);
    readonly dropTarget = signal<DropTarget | null>(null);

    onTreeDragEnd?: (event: PropertyTreeDragEnd) => void;
    onTreeDragStart?: (event: PropertyTreeDragStart) => void;
    onTreeDrop?: (event: PropertyTreeDrop) => void;

    dragging(): boolean {
        return this.dragNodeId() !== null;
    }

    start(tabId: string, groupId: string, node: PropertyTreeNode): void {
        this.dragNodeId.set(node.id);
        this.dropTarget.set(null);
        this.onTreeDragStart?.({ groupId, node, nodeId: node.id, tabId });
    }

    setDropTarget(target: DropTarget | null): void {
        this.dropTarget.set(target);
    }

    drop(tabId: string, groupId: string): void {
        const nodeId = this.dragNodeId();
        const target = this.dropTarget();

        if (nodeId && target?.valid) {
            this.onTreeDrop?.({ groupId, nodeId, position: target.position, tabId, targetNodeId: target.nodeId });
        }

        this.cancel(tabId, groupId);
    }

    cancel(tabId: string, groupId: string): void {
        if (!this.dragging()) {
            return;
        }

        this.dragNodeId.set(null);
        this.dropTarget.set(null);
        this.onTreeDragEnd?.({ groupId, tabId });
    }

    dropPositionFor(nodeId: string): PropertyTreeDropPosition | null {
        const target = this.dropTarget();

        return target && target.nodeId === nodeId && target.valid ? target.position : null;
    }

    isInvalidTarget(nodeId: string): boolean {
        const target = this.dropTarget();

        return target !== null && target.nodeId === nodeId && !target.valid;
    }
}
