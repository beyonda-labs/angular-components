import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LeftMenuAction } from '../../models/left-menu.model';
import { ActionListComponent } from './action-list.component';

describe('ActionListComponent', () => {
    let component: ActionListComponent;
    let fixture: ComponentFixture<ActionListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActionListComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ActionListComponent);
        component = fixture.componentInstance;
        component.prefix = 'test.left-menu';
        component.groupKey = 'top';
        component.actions = [
            new LeftMenuAction({
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox' })]
            })
        ];
        component.expanded = false;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open flyout on hover for collapsed actions with subactions', () => {
        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        component.onItemMouseEnter(action, actionPath);

        expect(component.shouldShowFlyout(action, actionPath)).toBe(true);
    });

    it('should open flyout for collapsed actions with subactions on first click', () => {
        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        component.onActionClick(action, actionPath);

        expect(component.shouldShowFlyout(action, actionPath)).toBe(true);
    });

    it('should close flyout after leaving the hovered item in collapsed mode', () => {
        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        component.onActionClick(action, actionPath);
        component.onItemMouseLeave(actionPath);

        expect(component.shouldShowFlyout(action, actionPath)).toBe(false);
    });

    it('should seed expanded submenus for actions with active descendants', () => {
        component.expanded = true;
        component.actions = [
            new LeftMenuAction({
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox', active: true })]
            })
        ];

        fixture.detectChanges();

        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        expect(component.shouldShowSubmenu(action, actionPath)).toBe(true);
        expect(component.hasSubmenuSelection(action)).toBe(true);
    });

    it('should allow closing an expanded submenu even when a descendant is active', () => {
        component.expanded = true;
        component.actions = [
            new LeftMenuAction({
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox', active: true })]
            })
        ];

        fixture.detectChanges();

        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        component.onActionClick(action, actionPath);

        expect(component.shouldShowSubmenu(action, actionPath)).toBe(false);
        expect(component.hasSubmenuSelection(action)).toBe(true);
    });

    it('should only toggle the submenu when a parent with subActions has no action of its own', () => {
        component.expanded = true;
        component.actions = [
            new LeftMenuAction({
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox' })]
            })
        ];

        fixture.detectChanges();

        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);
        const triggeredSpy = jest.fn();
        component.actionTriggered.subscribe(triggeredSpy);

        component.onActionClick(action, actionPath);

        expect(component.shouldShowSubmenu(action, actionPath)).toBe(true);
        expect(triggeredSpy).not.toHaveBeenCalled();
    });

    it('should run the action (not toggle) when clicking the label of a parent that has its own action', () => {
        component.expanded = true;
        const parentAction = jest.fn();
        component.actions = [
            new LeftMenuAction({
                action: parentAction,
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox' })]
            })
        ];

        fixture.detectChanges();

        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);

        component.onActionClick(action, actionPath, false, { target: document.createElement('span') } as unknown as MouseEvent);

        expect(parentAction).toHaveBeenCalled();
        expect(component.shouldShowSubmenu(action, actionPath)).toBe(false);
    });

    it('should toggle (not run the action) when clicking the chevron of a parent that has its own action', () => {
        component.expanded = true;
        const parentAction = jest.fn();
        component.actions = [
            new LeftMenuAction({
                action: parentAction,
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox' })]
            })
        ];

        fixture.detectChanges();

        const action = component.actions[0];
        const actionPath = component.buildPath(component.groupKey, action.key);
        const chevron = document.createElement('span');
        chevron.classList.add('bey-left-menu-action-chevron');
        const child = document.createElement('span');
        chevron.appendChild(child);

        component.onActionClick(action, actionPath, false, { target: child } as unknown as MouseEvent);

        expect(parentAction).not.toHaveBeenCalled();
        expect(component.shouldShowSubmenu(action, actionPath)).toBe(true);
    });

    it('should collapse other expanded branches when opening a new submenu', () => {
        component.expanded = true;
        component.actions = [
            new LeftMenuAction({
                key: 'documents',
                subActions: [new LeftMenuAction({ key: 'inbox' })]
            }),
            new LeftMenuAction({
                key: 'settings',
                subActions: [new LeftMenuAction({ key: 'profile' })]
            })
        ];

        fixture.detectChanges();

        const firstAction = component.actions[0];
        const secondAction = component.actions[1];
        const firstPath = component.buildPath(component.groupKey, firstAction.key);
        const secondPath = component.buildPath(component.groupKey, secondAction.key);

        component.onActionClick(firstAction, firstPath);
        component.onActionClick(secondAction, secondPath);

        expect(component.shouldShowSubmenu(firstAction, firstPath)).toBe(false);
        expect(component.shouldShowSubmenu(secondAction, secondPath)).toBe(true);
    });
});
