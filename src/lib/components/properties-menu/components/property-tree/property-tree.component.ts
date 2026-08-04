import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';

@Component({
    imports: [FontAwesomeModule, NgTemplateOutlet, TranslateModule],
    selector: 'bey-property-tree',
    standalone: true,
    styleUrls: ['./property-tree.component.css'],
    templateUrl: './property-tree.component.html'
})
export class PropertyTreeComponent {
    @Input({ required: true }) groupId!: string;
    @Input({ required: true }) nodes: PropertyTreeNode[] = [];
    @Input({ required: true }) tabId!: string;
    @Input() addBlockLabel?: string;

    readonly addIcon = faPlus;
    readonly chevronIcon = faChevronDown;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get visibleNodes(): PropertyTreeNode[] {
        return this.nodes.filter(node => !node.hidden);
    }

    getLabelKey(node: PropertyTreeNode): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'tree', node.id, node.label);
    }

    hasVisibleChildren(node: PropertyTreeNode): boolean {
        return this.visibleChildren(node).length > 0;
    }

    isSelected(node: PropertyTreeNode): boolean {
        return this.propertiesMenuService.selectedTreeNodeId() === node.id;
    }

    visibleChildren(node: PropertyTreeNode): PropertyTreeNode[] {
        return node.children.filter(child => !child.hidden);
    }

    onNodeClick(node: PropertyTreeNode): void {
        if (node.disabled) {
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
}
