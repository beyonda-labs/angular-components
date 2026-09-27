import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, linkedSignal, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { toKeySegment } from '../../../../internal/i18n/key-segment.util';
import { LeftMenuAction } from '../../models/left-menu.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, NgTemplateOutlet, TooltipModule, TranslateModule],
    selector: 'bey-left-menu-action-list',
    standalone: true,
    styleUrls: ['./action-list.component.css'],
    templateUrl: './action-list.component.html'
})
export class ActionListComponent {
    readonly actions = input.required<LeftMenuAction[]>();
    readonly expanded = input.required<boolean>();
    readonly prefix = input.required<string>();
    readonly groupKey = input('group');

    readonly actionTriggered = output<void>();

    /* Which branches the accordion has open. Reseeded from the active action whenever the inputs change. */
    readonly openPaths = linkedSignal<Set<string>>(() => {
        const activePath = this.expanded() ? this.findFirstActivePath(this.actions(), this.groupKey()) : null;

        return new Set(activePath ? this.getPathHierarchy(activePath) : []);
    });

    readonly activeFlyoutPath = signal<string | null>(null);

    readonly chevronDownIcon = faChevronDown;
    readonly chevronRightIcon = faChevronRight;

    buildPath(parentPath: string, key: string): string {
        return parentPath ? `${parentPath}.${key}` : key;
    }

    getActionTooltip(action: LeftMenuAction, forceExpanded = false): string {
        return this.expanded() || forceExpanded
            ? this.resolveActionText(action, 'tooltip')
            : this.resolveActionText(action, 'label');
    }

    getButtonTooltip(action: LeftMenuAction, path: string, forceExpanded = false): string {
        return this.shouldShowFlyout(action, path, forceExpanded) ? '' : this.getActionTooltip(action, forceExpanded);
    }

    getChevronIcon(path: string, forceExpanded = false): IconDefinition {
        return this.isSubmenuOpen(path, forceExpanded) ? this.chevronDownIcon : this.chevronRightIcon;
    }

    getExpandedState(action: LeftMenuAction, path: string, forceExpanded = false): boolean | null {
        if (!this.hasSubActions(action) || this.hasSubmenuToggle(action, forceExpanded)) {
            return null;
        }

        return this.isSubmenuOpen(path, forceExpanded);
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

    hasSubmenuToggle(action: LeftMenuAction, forceExpanded = false): boolean {
        return this.isInlineExpanded(forceExpanded) && this.hasSubActions(action) && Boolean(action.action);
    }

    isActionActive(action: LeftMenuAction): boolean {
        return action.active;
    }

    isInlineExpanded(forceExpanded = false): boolean {
        return this.expanded() || forceExpanded;
    }

    isSubmenuOpen(path: string, forceExpanded = false): boolean {
        if (forceExpanded || this.expanded()) {
            return this.openPaths().has(path);
        }

        return this.activeFlyoutPath() === path;
    }

    onActionClick(
        action: LeftMenuAction,
        path: string,
        forceExpanded = false,
        event: MouseEvent | undefined = undefined
    ): void {
        if (action.disabled) {
            return;
        }

        if (this.hasSubActions(action)) {
            const clickedChevron = this.isInlineExpanded(forceExpanded) && this.isChevronTarget(event);

            if (!this.isInlineExpanded(forceExpanded) || clickedChevron || !action.action) {
                this.toggleSubmenu(path, forceExpanded);

                return;
            }
        }

        action.action?.();
        this.actionTriggered.emit();
        this.activeFlyoutPath.set(null);
    }

    onItemMouseEnter(action: LeftMenuAction, path: string, forceExpanded = false): void {
        if (this.expanded() || forceExpanded || !this.hasSubActions(action) || action.disabled) {
            return;
        }

        this.activeFlyoutPath.set(path);
    }

    onItemMouseLeave(path: string, forceExpanded = false): void {
        if (!this.expanded() && !forceExpanded && this.activeFlyoutPath() === path) {
            this.activeFlyoutPath.set(null);
        }
    }

    onSubmenuToggleClick(path: string, forceExpanded = false): void {
        this.toggleSubmenu(path, forceExpanded);
    }

    shouldShowFlyout(action: LeftMenuAction, path: string, forceExpanded = false): boolean {
        return !this.isInlineExpanded(forceExpanded) && this.hasSubActions(action) && this.activeFlyoutPath() === path;
    }

    shouldShowSubmenu(action: LeftMenuAction, path: string, forceExpanded = false): boolean {
        return this.isInlineExpanded(forceExpanded) && this.hasSubActions(action) && this.openPaths().has(path);
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

    private getPathHierarchy(path: string): string[] {
        const segments = path.split('.');

        return segments.map((_segment, index) => segments.slice(0, index + 1).join('.'));
    }

    private isChevronTarget(event?: MouseEvent): boolean {
        return Boolean((event?.target as HTMLElement | undefined)?.closest('.bey-left-menu-action-chevron'));
    }

    private resolveActionText(action: LeftMenuAction, field: 'label' | 'tooltip'): string {
        const value = action[field];
        const defaultValue = `${action.key}.${field}`;

        if (!value || value === defaultValue) {
            return `${this.prefix()}.actions.${toKeySegment(action.key)}.${field}`;
        }

        return value;
    }

    private toggleSubmenu(path: string, forceExpanded = false): void {
        if (!this.expanded() && !forceExpanded) {
            this.activeFlyoutPath.update(current => (current === path ? null : path));

            return;
        }

        if (this.openPaths().has(path)) {
            this.openPaths.update(paths => {
                const next = new Set(paths);

                for (const openPath of paths) {
                    if (openPath === path || openPath.startsWith(`${path}.`)) {
                        next.delete(openPath);
                    }
                }

                return next;
            });

            return;
        }

        this.openPaths.set(new Set(this.getPathHierarchy(path)));
    }
}
