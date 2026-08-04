import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonType } from '../../internal/button/models/button-config.model';
import { HeaderComponent } from './header.component';
import { HeaderAction, HeaderActionType, HeaderConfig, HeaderVariant } from './models/header.model';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should render title and both action zones inside a single end-aligned group', () => {
        component.config = buildConfig({
            title: 'test.header.title',
            leftActions: [new HeaderAction({ key: 'back', type: HeaderActionType.Text })],
            rightActions: [new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton })]
        });

        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.bey-header-title');
        const actionButtons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
        const endContainer = fixture.nativeElement.querySelector('.bey-header-actions-end');

        expect(title?.textContent?.trim()).toBe('test.header.title');
        expect(actionButtons).toHaveLength(2);
        expect(endContainer).toBeTruthy();
    });

    it('should set the title element native tooltip so long titles remain readable when truncated', () => {
        component.config = buildConfig({ title: 'test.header.title' });

        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.bey-header-title');

        expect(title?.getAttribute('title')).toBe('test.header.title');
    });

    it('should hide optional sections when title and actions are missing', () => {
        component.config = buildConfig({ title: '', leftActions: [], rightActions: [] });

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-header-title')).toBeNull();
        expect(fixture.nativeElement.querySelector('.bey-header-actions-end')).toBeNull();
    });

    it('should build a button config with mapped type and explicit texts', () => {
        const action = new HeaderAction({
            action: jest.fn(),
            key: 'save',
            label: 'custom.label',
            tooltip: 'custom.tooltip',
            type: HeaderActionType.SecondaryButton
        });
        component.config = buildConfig();

        const button = component.getActionButton(action);

        expect(button.action).toBe(action.action);
        expect(button.label).toBe('custom.label');
        expect(button.tooltip).toBe('custom.tooltip');
        expect(button.type).toBe(ButtonType.Secondary);
    });

    it('should propagate disabled state onto the button config', () => {
        const action = new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton, disabled: true });
        component.config = buildConfig();

        const button = component.getActionButton(action);

        expect(button.isDisabled).toBe(true);
    });

    it('should default disabled to false', () => {
        const action = new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton });
        component.config = buildConfig();

        const button = component.getActionButton(action);

        expect(button.isDisabled).toBe(false);
    });

    it('should resolve default translation keys for action texts', () => {
        const action = new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton });
        component.config = buildConfig({ prefix: 'demo.header' });

        const button = component.getActionButton(action);

        expect(button.label).toBe('demo.header.actions.save.label');
        expect(button.tooltip).toBe('demo.header.actions.save.tooltip');
        expect(button.type).toBe(ButtonType.Primary);
    });

    it('should fallback to tertiary button and noop action for text actions without callback', () => {
        const action = new HeaderAction({ key: 'cancel', type: HeaderActionType.Text });
        component.config = buildConfig();

        const button = component.getActionButton(action);

        expect(button.type).toBe(ButtonType.Tertiary);
        expect(() => button.action()).not.toThrow();
    });

    it('should render leftActions, then the menu toggle, then rightActions in that order', () => {
        component.config = buildConfig({
            leftActions: [new HeaderAction({ key: 'back', type: HeaderActionType.Text })],
            menuActions: [new HeaderAction({ key: 'export', type: HeaderActionType.Text })],
            rightActions: [new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton })]
        });

        fixture.detectChanges();

        const endContainer = fixture.nativeElement.querySelector('.bey-header-actions-end') as HTMLElement;
        const menu = endContainer.querySelector('.bey-header-menu');

        expect(menu).toBeTruthy();
        expect([...endContainer.children].indexOf(menu as Element)).toBe(1);
    });

    it('should render the menu toggle as the last element when no right actions are present', () => {
        component.config = buildConfig({
            leftActions: [new HeaderAction({ key: 'back', type: HeaderActionType.Text })],
            menuActions: [new HeaderAction({ key: 'export', type: HeaderActionType.Text })]
        });

        fixture.detectChanges();

        const endContainer = fixture.nativeElement.querySelector('.bey-header-actions-end') as HTMLElement;
        const menu = endContainer.querySelector('.bey-header-menu');

        expect(menu).toBeTruthy();
        expect(endContainer.lastElementChild).toBe(menu);
    });

    it('should render the end zone when only menu actions are present', () => {
        component.config = buildConfig({
            menuActions: [new HeaderAction({ key: 'export', type: HeaderActionType.Text })]
        });

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-header-actions-end .bey-header-menu')).toBeTruthy();
    });

    it('should return empty title when config title is not defined', () => {
        component.config = buildConfig();
        component.config.title = undefined as unknown as string;

        expect(component.getTitle()).toBe('');
    });

    it('should render the back action before the title', () => {
        component.config = buildConfig({
            backAction: new HeaderAction({ key: 'back', type: HeaderActionType.Text })
        });

        fixture.detectChanges();

        const startContainer = fixture.nativeElement.querySelector('.bey-header-start') as HTMLElement;

        expect(startContainer.querySelector('bey-button')).toBeTruthy();
        expect([...startContainer.children].indexOf(startContainer.querySelector('bey-button') as Element)).toBe(0);
    });

    it('should not render a back button when backAction is not set', () => {
        component.config = buildConfig();

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-header-start bey-button')).toBeNull();
    });

    it('should render the badge next to the title when set', () => {
        component.config = buildConfig({ badge: { text: 'test.header.badge' } });

        fixture.detectChanges();

        const badge = fixture.nativeElement.querySelector('.bey-header-badge');

        expect(badge?.textContent?.trim()).toBe('test.header.badge');
    });

    it('should not render a badge when it is not set', () => {
        component.config = buildConfig();

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-header-badge')).toBeNull();
    });

    it('should default to the page variant title size', () => {
        component.config = buildConfig();

        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.bey-header-title');

        expect(title?.classList.contains('fs-2')).toBe(true);
    });

    it('should apply the subpage variant title size', () => {
        component.config = buildConfig({ variant: HeaderVariant.SubPage });

        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.bey-header-title');

        expect(title?.classList.contains('fs-4')).toBe(true);
    });

    describe('sub-actions dropdown', () => {
        it('should render a toggle instead of executing the action directly when subActions are present', () => {
            const subActionExecuted = jest.fn();
            const parentAction = jest.fn();
            const action = new HeaderAction({
                action: parentAction,
                key: 'create',
                type: HeaderActionType.PrimaryButton,
                subActions: [
                    new HeaderAction({ action: subActionExecuted, key: 'create-item', type: HeaderActionType.Text })
                ]
            });

            component.config = buildConfig({ rightActions: [action] });
            fixture.detectChanges();

            const endContainer = fixture.nativeElement.querySelector('.bey-header-actions-end') as HTMLElement;

            expect(endContainer.querySelector('.bey-header-action-menu')).toBeTruthy();

            const toggleButton = endContainer.querySelector('button') as HTMLButtonElement;
            toggleButton.click();
            fixture.detectChanges();

            expect(parentAction).not.toHaveBeenCalled();
            expect(endContainer.querySelector('.bey-header-menu-panel')).toBeTruthy();
        });

        it('should execute the sub-action and close the panel on click', () => {
            const subActionExecuted = jest.fn();
            const action = new HeaderAction({
                key: 'create',
                type: HeaderActionType.PrimaryButton,
                subActions: [
                    new HeaderAction({ action: subActionExecuted, key: 'create-item', type: HeaderActionType.Text })
                ]
            });

            component.config = buildConfig({ rightActions: [action] });
            fixture.detectChanges();

            component.toggleActionMenu(action);
            fixture.detectChanges();

            const panel = fixture.nativeElement.querySelector('.bey-header-menu-panel') as HTMLElement;
            const subButton = panel.querySelector('button') as HTMLButtonElement;

            subButton.click();

            expect(subActionExecuted).toHaveBeenCalled();
            expect(component.isActionMenuOpen(action)).toBe(false);
        });

        it('should close the open action menu on outside click', () => {
            const action = new HeaderAction({
                key: 'create',
                type: HeaderActionType.PrimaryButton,
                subActions: [new HeaderAction({ key: 'create-item', type: HeaderActionType.Text })]
            });

            component.config = buildConfig({ rightActions: [action] });
            fixture.detectChanges();
            component.toggleActionMenu(action);

            component.onDocumentClick({ target: document.body } as unknown as MouseEvent);

            expect(component.isActionMenuOpen(action)).toBe(false);
        });

        it('should close the open action menu on Escape', () => {
            const action = new HeaderAction({
                key: 'create',
                type: HeaderActionType.PrimaryButton,
                subActions: [new HeaderAction({ key: 'create-item', type: HeaderActionType.Text })]
            });

            component.config = buildConfig({ rightActions: [action] });
            fixture.detectChanges();
            component.toggleActionMenu(action);

            component.onEscape();

            expect(component.isActionMenuOpen(action)).toBe(false);
        });

        it('should toggle the menu closed when clicked again', () => {
            const action = new HeaderAction({
                key: 'create',
                type: HeaderActionType.PrimaryButton,
                subActions: [new HeaderAction({ key: 'create-item', type: HeaderActionType.Text })]
            });

            component.toggleActionMenu(action);
            expect(component.isActionMenuOpen(action)).toBe(true);

            component.toggleActionMenu(action);
            expect(component.isActionMenuOpen(action)).toBe(false);
        });

        it('hasSubActions should be false for a plain action', () => {
            const action = new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton });

            expect(component.hasSubActions(action)).toBe(false);
        });
    });
});

function buildConfig(overrides?: Partial<HeaderConfig>): HeaderConfig {
    return new HeaderConfig({
        prefix: overrides?.prefix ?? 'test.header',
        title: overrides?.title ?? 'test.header.title',
        backAction: overrides?.backAction,
        badge: overrides?.badge,
        leftActions: overrides?.leftActions ?? [],
        menuActions: overrides?.menuActions ?? [],
        rightActions: overrides?.rightActions ?? [],
        variant: overrides?.variant
    });
}
