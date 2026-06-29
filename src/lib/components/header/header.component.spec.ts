import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonType } from '../../internal/button/models/button-config.model';
import { HeaderComponent } from './header.component';
import { HeaderAction, HeaderActionType, HeaderConfig } from './models/header.model';

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

    it('should render title and actions on both sides', () => {
        component.config = buildConfig({
            title: 'test.header.title',
            leftActions: [new HeaderAction({ key: 'back', type: HeaderActionType.Text })],
            rightActions: [new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton })]
        });

        fixture.detectChanges();

        const title = fixture.nativeElement.querySelector('.bey-header-title');
        const actionButtons = fixture.debugElement.queryAll(By.directive(ButtonComponent));
        const leftContainer = fixture.nativeElement.querySelector('.bey-header-actions-left');
        const rightContainer = fixture.nativeElement.querySelector('.bey-header-actions-right');

        expect(title?.textContent?.trim()).toBe('test.header.title');
        expect(actionButtons).toHaveLength(2);
        expect(leftContainer).toBeTruthy();
        expect(rightContainer).toBeTruthy();
    });

    it('should hide optional sections when title and actions are missing', () => {
        component.config = buildConfig({ title: '', leftActions: [], rightActions: [] });

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-header-title')).toBeNull();
        expect(fixture.nativeElement.querySelector('.bey-header-actions-left')).toBeNull();
        expect(fixture.nativeElement.querySelector('.bey-header-actions-right')).toBeNull();
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

    it('should return empty title when config title is not defined', () => {
        component.config = buildConfig();
        component.config.title = undefined as unknown as string;

        expect(component.getTitle()).toBe('');
    });
});

function buildConfig(overrides?: Partial<HeaderConfig>): HeaderConfig {
    return new HeaderConfig({
        prefix: overrides?.prefix ?? 'test.header',
        title: overrides?.title ?? 'test.header.title',
        leftActions: overrides?.leftActions ?? [],
        rightActions: overrides?.rightActions ?? []
    });
}
