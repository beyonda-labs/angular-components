import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { TreeConfig, TreeNode } from './models/tree.model';

const BASE_INDENT_REM = 0.6;
const LEVEL_INDENT_REM = 1.25;

@Component({
    imports: [FontAwesomeModule, NgTemplateOutlet, TranslateModule],
    selector: 'bey-tree',
    standalone: true,
    styleUrls: ['./tree.component.css'],
    templateUrl: './tree.component.html'
})
export class TreeComponent {
    @Input({ required: true })
    set config(value: TreeConfig) {
        this._config = value;
        this.seedExpandedKeys();
    }
    get config(): TreeConfig {
        return this._config;
    }

    readonly toggleIcon = faChevronRight;

    private _config!: TreeConfig;
    private readonly expandedKeys = new Set<string>();

    getIndent(level: number): number {
        return BASE_INDENT_REM + level * LEVEL_INDENT_REM;
    }

    getLabel(node: TreeNode): string {
        const defaultValue = `${node.key}.label`;

        if (!node.label || node.label === defaultValue) {
            return `${this.config.prefix}.nodes.${defaultValue}`;
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
        return this.expandedKeys.has(node.key);
    }

    isSelected(node: TreeNode): boolean {
        return Boolean(this.config.selectedKey) && this.config.selectedKey === node.key;
    }

    onNodeClick(node: TreeNode): void {
        if (node.isDisabled) {
            return;
        }

        this.config.onNodeSelect?.(node);
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

    private seedExpandedKeys(): void {
        this.expandedKeys.clear();
        this.config?.expandedKeys?.forEach(key => this.expandedKeys.add(key));
    }

    private toggleNode(node: TreeNode): void {
        const expanded = !this.isExpanded(node);

        if (expanded) {
            this.expandedKeys.add(node.key);
        } else {
            this.expandedKeys.delete(node.key);
        }

        this.config.onNodeToggle?.(node, expanded);
    }
}
