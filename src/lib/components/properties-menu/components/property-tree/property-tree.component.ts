import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';
import { findTreeNode, isDropAllowed, PropertyTreeDropPosition } from '../../utils/property-tree-drop.util';

const AUTO_EXPAND_DELAY_MS = 600;
const AUTO_SCROLL_EDGE_PX = 24;
const AUTO_SCROLL_STEP_PX = 8;
const DRAG_THRESHOLD_PX = 4;
const EDGE_ZONE_RATIO = 0.25;
const ROW_SELECTOR = '.bey-property-tree-row';

@Component({
    imports: [FontAwesomeModule, NgTemplateOutlet, TranslateModule],
    selector: 'bey-property-tree',
    standalone: true,
    styleUrls: ['./property-tree.component.css'],
    templateUrl: './property-tree.component.html'
})
export class PropertyTreeComponent implements OnDestroy {
    @Input({ required: true }) groupId!: string;
    @Input({ required: true }) nodes: PropertyTreeNode[] = [];
    @Input({ required: true }) tabId!: string;
    @Input() acceptsRootDrop = false;
    @Input() addBlockLabel?: string;

    readonly addIcon = faPlus;
    readonly chevronIcon = faChevronDown;

    private readonly hostElement = inject(ElementRef<HTMLElement>);
    private readonly propertiesMenuService = inject(PropertiesMenuService);
    private readonly propertyTreeDragService = inject(PropertyTreeDragService);

    private autoExpandNodeId: string | null = null;
    private autoExpandTimer?: ReturnType<typeof setTimeout>;
    private dragCandidate?: { node: PropertyTreeNode; x: number; y: number };
    private draggedRecently = false;

    get visibleNodes(): PropertyTreeNode[] {
        return this.nodes.filter(node => !node.hidden);
    }

    ngOnDestroy(): void {
        this.detachPointerListeners();
        this.clearAutoExpand();
    }

    getLabelKey(node: PropertyTreeNode): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'tree', node.id, node.label);
    }

    hasVisibleChildren(node: PropertyTreeNode): boolean {
        return this.visibleChildren(node).length > 0;
    }

    isDragged(node: PropertyTreeNode): boolean {
        return this.propertyTreeDragService.dragNodeId() === node.id;
    }

    isInvalidTarget(node: PropertyTreeNode): boolean {
        return this.propertyTreeDragService.isInvalidTarget(node.id);
    }

    isSelected(node: PropertyTreeNode): boolean {
        return this.propertiesMenuService.selectedTreeNodeId() === node.id;
    }

    dropPositionFor(node: PropertyTreeNode): PropertyTreeDropPosition | null {
        return this.propertyTreeDragService.dropPositionFor(node.id);
    }

    visibleChildren(node: PropertyTreeNode): PropertyTreeNode[] {
        return node.children.filter(child => !child.hidden);
    }

    onNodeClick(node: PropertyTreeNode): void {
        if (node.disabled || this.draggedRecently) {
            return;
        }

        this.propertiesMenuService.selectTreeNode(this.tabId, this.groupId, node.id);
    }

    onToggleClick(event: Event, node: PropertyTreeNode): void {
        event.stopPropagation();
        this.propertiesMenuService.toggleTreeNode(this.tabId, this.groupId, node.id);
    }

    onAddBlockClick(): void {
        this.propertiesMenuService.triggerTreeAddBlock(this.tabId, this.groupId);
    }

    onRowPointerDown(event: PointerEvent, node: PropertyTreeNode): void {
        if (event.button !== 0 || event.pointerType === 'touch' || !node.draggable || node.disabled) {
            return;
        }

        this.dragCandidate = { node, x: event.clientX, y: event.clientY };
        this.draggedRecently = false;

        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
        document.addEventListener('pointercancel', this.handlePointerUp);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    private readonly handlePointerMove = (event: PointerEvent): void => {
        const candidate = this.dragCandidate;

        if (!candidate) {
            return;
        }

        if (!this.propertyTreeDragService.dragging()) {
            const travelled = Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y);

            if (travelled < DRAG_THRESHOLD_PX) {
                return;
            }

            this.draggedRecently = true;
            this.propertyTreeDragService.start(this.tabId, this.groupId, candidate.node);
        }

        event.preventDefault();
        this.autoScroll(event.clientY);
        this.updateDropTarget(event, candidate.node);
    };

    private readonly handlePointerUp = (): void => {
        if (this.propertyTreeDragService.dragging()) {
            this.propertyTreeDragService.drop(this.tabId, this.groupId);
        }

        this.detachPointerListeners();
    };

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.propertyTreeDragService.cancel(this.tabId, this.groupId);
            this.detachPointerListeners();
        }
    };

    private updateDropTarget(event: PointerEvent, dragged: PropertyTreeNode): void {
        const row = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest(ROW_SELECTOR) as HTMLElement | null;
        const nodeId = row?.dataset['nodeId'];

        if (!row || !nodeId || !this.hostElement.nativeElement.contains(row)) {
            this.propertyTreeDragService.setDropTarget(null);
            this.clearAutoExpand();

            return;
        }

        const position = this.resolvePosition(row.getBoundingClientRect(), event.clientY);
        const valid = isDropAllowed(this.nodes, dragged.id, nodeId, position, this.acceptsRootDrop);

        this.propertyTreeDragService.setDropTarget({ nodeId, position, valid });
        this.scheduleAutoExpand(position === 'inside' && valid ? nodeId : null);
    }

    private resolvePosition(rect: DOMRect, clientY: number): PropertyTreeDropPosition {
        const offset = (clientY - rect.top) / rect.height;

        if (offset < EDGE_ZONE_RATIO) {
            return 'before';
        }

        return offset > 1 - EDGE_ZONE_RATIO ? 'after' : 'inside';
    }

    private scheduleAutoExpand(nodeId: string | null): void {
        if (nodeId === this.autoExpandNodeId) {
            return;
        }

        this.clearAutoExpand();
        this.autoExpandNodeId = nodeId;

        if (!nodeId) {
            return;
        }

        this.autoExpandTimer = setTimeout(() => {
            const node = findTreeNode(this.nodes, nodeId);

            if (node && !node.expanded && this.hasVisibleChildren(node)) {
                this.propertiesMenuService.toggleTreeNode(this.tabId, this.groupId, nodeId);
            }
        }, AUTO_EXPAND_DELAY_MS);
    }

    private clearAutoExpand(): void {
        clearTimeout(this.autoExpandTimer);
        this.autoExpandTimer = undefined;
        this.autoExpandNodeId = null;
    }

    private autoScroll(clientY: number): void {
        const container = this.scrollableAncestor();

        if (!container) {
            return;
        }

        const rect = container.getBoundingClientRect();

        if (clientY - rect.top < AUTO_SCROLL_EDGE_PX) {
            container.scrollTop -= AUTO_SCROLL_STEP_PX;
        } else if (rect.bottom - clientY < AUTO_SCROLL_EDGE_PX) {
            container.scrollTop += AUTO_SCROLL_STEP_PX;
        }
    }

    private scrollableAncestor(): HTMLElement | null {
        let current = this.hostElement.nativeElement.parentElement as HTMLElement | null;

        while (current) {
            if (current.scrollHeight > current.clientHeight) {
                return current;
            }

            current = current.parentElement;
        }

        return null;
    }

    private detachPointerListeners(): void {
        this.dragCandidate = undefined;
        this.clearAutoExpand();

        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);
        document.removeEventListener('pointercancel', this.handlePointerUp);
        document.removeEventListener('keydown', this.handleKeyDown);

        setTimeout(() => (this.draggedRecently = false));
    }
}
