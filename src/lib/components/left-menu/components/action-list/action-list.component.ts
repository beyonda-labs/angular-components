import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { LeftMenuAction } from '../../models/left-menu.model';

@Component({
    imports: [FontAwesomeModule, NgTemplateOutlet, TooltipModule, TranslateModule],
    selector: 'bey-left-menu-action-list',
    standalone: true,
    styleUrls: ['./action-list.component.css'],
    templateUrl: './action-list.component.html'
})
export class ActionListComponent {
    @Input({ required: true })
    set actions(value: LeftMenuAction[]) {
        this._actions = value;
        this.syncAccordionState();
    }

    get actions(): LeftMenuAction[] {
        return this._actions;
    }

    @Input({ required: true })
    set expanded(value: boolean) {
        this._expanded = value;
        this.syncAccordionState();
    }

    get expanded(): boolean {
        return this._expanded;
    }

    @Input({ required: true }) prefix = '';
    @Input()
    set groupKey(value: string) {
        this._groupKey = value;
        this.syncAccordionState();
    }

    get groupKey(): string {
        return this._groupKey;
    }

    @Output() actionTriggered = new EventEmitter<void>();

    readonly chevronDownIcon = faChevronDown;
    readonly chevronRightIcon = faChevronRight;

    private _actions: LeftMenuAction[] = [];
    private _expanded = true;
    private _groupKey = 'group';
    private activeFlyoutPath: string | null = null;
    private hasSeededExpandedOpenPaths = false;
    private readonly openPaths = new Set<string>();

    buildPath(parentPath: string, key: string): string {
        return parentPath ? `${parentPath}.${key}` : key;
    }

    getActionTooltip(action: LeftMenuAction, forceExpanded = false): string {
        if (this.expanded || forceExpanded) {
            return this.resolveActionText(action, 'tooltip');
        }

        return this.resolveActionText(action, 'label');
    }

    getButtonTooltip(action: LeftMenuAction, path: string, forceExpanded = false): string {
        if (this.shouldShowFlyout(action, path, forceExpanded)) {
            return '';
        }

        return this.getActionTooltip(action, forceExpanded);
    }

    getChevronIcon(path: string, forceExpanded = false) {
        return this.isSubmenuOpen(path, forceExpanded) ? this.chevronDownIcon : this.chevronRightIcon;
    }

    getLabel(action: LeftMenuAction): string {
        return this.resolveActionText(action, 'label');
    }

    hasActiveDescendant(action: LeftMenuAction): boolean {
        return action.subActions.some(subAction => subAction.active || this.hasActiveDescendant(subAction));
    }

    hasSubActions(action: LeftMenuAction): boolean {
        return action.subActions.length > 0;
    }

    hasSubmenuSelection(action: LeftMenuAction): boolean {
        return !action.active && this.hasActiveDescendant(action);
    }

    isActionActive(action: LeftMenuAction): boolean {
        return action.active;
    }

    isInlineExpanded(forceExpanded = false): boolean {
        return this.expanded || forceExpanded;
    }

    isSubmenuOpen(path: string, forceExpanded = false): boolean {
        if (forceExpanded) {
            return this.openPaths.has(path);
        }

        if (this.expanded) {
            return this.openPaths.has(path);
        }

        return this.activeFlyoutPath === path;
    }

    onItemMouseEnter(action: LeftMenuAction, path: string, forceExpanded = false): void {
        if (this.expanded || forceExpanded || !this.hasSubActions(action) || action.disabled) {
            return;
        }

        this.activeFlyoutPath = path;
    }

    onActionClick(action: LeftMenuAction, path: string, forceExpanded = false): void {
        if (action.disabled) {
            return;
        }

        if (this.hasSubActions(action)) {
            this.toggleSubmenu(path, forceExpanded);

            if (!action.action) {
                return;
            }
        }

        action.action?.();
        this.actionTriggered.emit();
        this.activeFlyoutPath = null;
    }

    onItemMouseLeave(path: string, forceExpanded = false): void {
        if (!this.expanded && !forceExpanded && this.activeFlyoutPath === path) {
            this.activeFlyoutPath = null;
        }
    }

    shouldShowFlyout(action: LeftMenuAction, path: string, forceExpanded = false): boolean {
        return !this.isInlineExpanded(forceExpanded) && this.hasSubActions(action) && this.activeFlyoutPath === path;
    }

    shouldShowSubmenu(action: LeftMenuAction, path: string, forceExpanded = false): boolean {
        return this.isInlineExpanded(forceExpanded) && this.hasSubActions(action) && this.openPaths.has(path);
    }

    private resolveActionText(action: LeftMenuAction, field: 'label' | 'tooltip'): string {
        const value = action[field];
        const defaultValue = `${action.key}.${field}`;

        if (!value || value === defaultValue) {
            return `${this.prefix}.actions.${defaultValue}`;
        }

        return value;
    }

    private toggleSubmenu(path: string, forceExpanded = false): void {
        if (!this.expanded && !forceExpanded) {
            this.activeFlyoutPath = this.activeFlyoutPath === path ? null : path;

            return;
        }

        if (this.openPaths.has(path)) {
            this.closePathBranch(path);

            return;
        }

        this.openAccordionPath(path);
    }

    private closePathBranch(path: string): void {
        for (const openPath of [...this.openPaths]) {
            if (openPath === path || openPath.startsWith(`${path}.`)) {
                this.openPaths.delete(openPath);
            }
        }
    }

    private openAccordionPath(path: string): void {
        this.openPaths.clear();

        for (const segmentPath of this.getPathHierarchy(path)) {
            this.openPaths.add(segmentPath);
        }
    }

    private getPathHierarchy(path: string): string[] {
        const segments = path.split('.');

        return segments.map((_segment, index) => segments.slice(0, index + 1).join('.'));
    }

    private resetExpandedOpenPaths(): void {
        this.hasSeededExpandedOpenPaths = false;
        this.openPaths.clear();
    }

    private syncAccordionState(): void {
        this.resetExpandedOpenPaths();
        this.syncExpandedOpenPaths();
    }

    private syncExpandedOpenPaths(): void {
        if (!this.expanded || this.hasSeededExpandedOpenPaths) {
            return;
        }

        const activePath = this.findFirstActivePath(this.actions, this.groupKey);

        if (activePath) {
            this.openAccordionPath(activePath);
        }

        this.hasSeededExpandedOpenPaths = true;
    }

    private findFirstActivePath(actions: LeftMenuAction[], parentPath: string): string | null {
        for (const action of actions) {
            const actionPath = this.buildPath(parentPath, action.key);

            if (action.active) {
                return actionPath;
            }

            if (this.hasSubActions(action)) {
                const nestedActivePath = this.findFirstActivePath(action.subActions, actionPath);

                if (nestedActivePath) {
                    return nestedActivePath;
                }
            }
        }

        return null;
    }
}
