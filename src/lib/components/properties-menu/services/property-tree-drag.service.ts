import { inject, Injectable, signal } from '@angular/core';

import { PropertyTreeDropPosition, PropertyTreeNode } from '../models/property-tree-node.model';
import { PropertiesMenuService } from './properties-menu.service';

interface DropTarget {
    nodeId: string;
    position: PropertyTreeDropPosition;
    valid: boolean;
}

@Injectable()
export class PropertyTreeDragService {
    private readonly propertiesMenuService = inject(PropertiesMenuService);

    readonly dragNodeId = signal<string | null>(null);
    readonly dropTarget = signal<DropTarget | null>(null);

    cancel(tabId: string, groupId: string): void {
        if (!this.dragging()) {
            return;
        }

        this.dragNodeId.set(null);
        this.dropTarget.set(null);
        this.propertiesMenuService.config().onTreeDragEnd?.({ groupId, tabId });
    }

    dragging(): boolean {
        return this.dragNodeId() !== null;
    }

    drop(tabId: string, groupId: string): void {
        const nodeId = this.dragNodeId();
        const target = this.dropTarget();

        if (nodeId && target?.valid) {
            this.propertiesMenuService
                .config()
                .onTreeDrop?.({ groupId, nodeId, position: target.position, tabId, targetNodeId: target.nodeId });
        }

        this.cancel(tabId, groupId);
    }

    dropPositionFor(nodeId: string): PropertyTreeDropPosition | null {
        const target = this.dropTarget();

        return target && target.nodeId === nodeId && target.valid ? target.position : null;
    }

    isInvalidTarget(nodeId: string): boolean {
        const target = this.dropTarget();

        return target !== null && target.nodeId === nodeId && !target.valid;
    }

    setDropTarget(target: DropTarget | null): void {
        this.dropTarget.set(target);
    }

    start(tabId: string, groupId: string, node: PropertyTreeNode): void {
        this.dragNodeId.set(node.id);
        this.dropTarget.set(null);
        this.propertiesMenuService.config().onTreeDragStart?.({ groupId, node, nodeId: node.id, tabId });
    }
}
