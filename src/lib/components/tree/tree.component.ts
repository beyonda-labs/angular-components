import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { toKeySegment } from '../../internal/i18n/key-segment';
import { TreeConfig, TreeNode } from './models/tree.model';

const BASE_INDENT_REM = 0.6;
const LEVEL_INDENT_REM = 1.25;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, NgTemplateOutlet, TooltipModule, TranslateModule],
    selector: 'bey-tree',
    standalone: true,
    styleUrls: ['./tree.component.css'],
    templateUrl: './tree.component.html'
})
export class TreeComponent {
    readonly config = input.required<TreeConfig>();

    readonly expandedKeys = linkedSignal(() => new Set(this.config().expandedKeys ?? []));
    readonly selectedKey = computed(() => this.config().selectedKey);
    readonly toggleIcon = faChevronRight;

    getIndent(level: number): number {
        return BASE_INDENT_REM + level * LEVEL_INDENT_REM;
    }

    getLabel(node: TreeNode): string {
        const defaultValue = `${node.key}.label`;

        if (!node.label || node.label === defaultValue) {
            return `${this.config().prefix}.nodes.${toKeySegment(node.key)}.label`;
        }

        return node.label;
    }

    getToggleLabel(node: TreeNode): string {
        return this.isExpanded(node) ? 'angular-components.tree.collapse' : 'angular-components.tree.expand';
    }

    hasChildren(node: TreeNode): boolean {
        return node.children.length > 0;
    }

    isExpanded(node: TreeNode): boolean {
        return this.expandedKeys().has(node.key);
    }

    isSelected(node: TreeNode): boolean {
        return Boolean(this.selectedKey()) && this.selectedKey() === node.key;
    }

    onNodeClick(node: TreeNode): void {
        if (node.isDisabled) {
            return;
        }

        this.config().onNodeSelect?.(node);
    }

    onNodeKeydown(event: Event, node: TreeNode): void {
        event.preventDefault();
        this.onNodeClick(node);
    }

    onToggleClick(event: Event, node: TreeNode): void {
        event.stopPropagation();

        if (node.isDisabled || !this.hasChildren(node)) {
            return;
        }

        this.toggleNode(node);
    }

    private toggleNode(node: TreeNode): void {
        const expanded = !this.isExpanded(node);

        this.expandedKeys.update(keys => {
            const next = new Set(keys);

            if (expanded) {
                next.add(node.key);
            } else {
                next.delete(node.key);
            }

            return next;
        });

        this.config().onNodeToggle?.(node, expanded);
    }
}
