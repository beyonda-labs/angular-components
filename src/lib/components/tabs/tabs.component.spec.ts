import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { Tab, TabsConfig } from './models/tabs.model';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
    let component: TabsComponent;
    let fixture: ComponentFixture<TabsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TabsComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TabsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should default active tab to the first tab', () => {
        component.config = buildConfig();
        fixture.detectChanges();
        expect(component.activeTabKey).toBe('general');
    });

    it('should render the correct number of tabs', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        expect(tabs.length).toBe(3);
    });

    it('should mark the active tab with aria-selected true', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should add active class to the active tab', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        expect(tabs[0].classList.contains('bey-tabs-tab-active')).toBe(true);
        expect(tabs[1].classList.contains('bey-tabs-tab-active')).toBe(false);
    });

    it('should call onTabChange when clicking a tab', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({ onTabChange });
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        tabs[1].click();
        fixture.detectChanges();

        expect(onTabChange).toHaveBeenCalledWith('details');
        expect(component.activeTabKey).toBe('details');
    });

    it('should not call onTabChange when clicking a disabled tab', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({
            onTabChange,
            tabs: [
                new Tab({ key: 'general' }),
                new Tab({ key: 'details', isDisabled: true }),
                new Tab({ key: 'history' })
            ]
        });
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        tabs[1].click();

        expect(onTabChange).not.toHaveBeenCalled();
        expect(component.activeTabKey).toBe('general');
    });

    it('should set disabled attribute on disabled tabs', () => {
        component.config = buildConfig({
            tabs: [
                new Tab({ key: 'general' }),
                new Tab({ key: 'details', isDisabled: true })
            ]
        });
        fixture.detectChanges();

        const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
        expect(tabs[0].disabled).toBe(false);
        expect(tabs[1].disabled).toBe(true);
    });

    it('should resolve tab labels with prefix', () => {
        const config = buildConfig();
        component.config = config;

        const tab = config.tabs[0];
        const label = component.getTabLabel(tab);
        expect(label).toBe('test.tabs.tabs.general.label');
    });

    it('should use custom label when provided', () => {
        component.config = buildConfig({
            tabs: [new Tab({ key: 'general', label: 'custom.label' })]
        });

        const label = component.getTabLabel(component.config.tabs[0]);
        expect(label).toBe('custom.label');
    });

    it('should programmatically change active tab via setActiveTab', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({ onTabChange });
        fixture.detectChanges();

        component.config.setActiveTab('details');
        expect(onTabChange).toHaveBeenCalledWith('details');
    });

    it('should not change to a disabled tab via setActiveTab', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({
            onTabChange,
            tabs: [
                new Tab({ key: 'general' }),
                new Tab({ key: 'details', isDisabled: true })
            ]
        });

        component.config.setActiveTab('details');
        expect(onTabChange).not.toHaveBeenCalled();
        expect(component.config.activeTab).toBe('general');
    });

    it('should navigate to next tab on ArrowRight', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({ onTabChange });
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onKeydown(event);
        fixture.detectChanges();

        expect(component.activeTabKey).toBe('details');
    });

    it('should navigate to previous tab on ArrowLeft', () => {
        const onTabChange = jest.fn();
        component.config = buildConfig({ onTabChange, activeTab: 'details' });
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.onKeydown(event);
        fixture.detectChanges();

        expect(component.activeTabKey).toBe('general');
    });

    it('should wrap around on ArrowRight from last tab', () => {
        component.config = buildConfig({ activeTab: 'history' });
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onKeydown(event);

        expect(component.activeTabKey).toBe('general');
    });

    it('should navigate to first tab on Home', () => {
        component.config = buildConfig({ activeTab: 'history' });
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'Home' });
        component.onKeydown(event);

        expect(component.activeTabKey).toBe('general');
    });

    it('should navigate to last tab on End', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'End' });
        component.onKeydown(event);

        expect(component.activeTabKey).toBe('history');
    });

    it('should skip disabled tabs during keyboard navigation', () => {
        component.config = buildConfig({
            tabs: [
                new Tab({ key: 'general' }),
                new Tab({ key: 'details', isDisabled: true }),
                new Tab({ key: 'history' })
            ]
        });
        fixture.detectChanges();

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onKeydown(event);

        expect(component.activeTabKey).toBe('history');
    });

    it('should have role tablist on the container', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
        expect(tablist).toBeTruthy();
    });

    it('should sync activeTabKey when config input changes', () => {
        component.config = buildConfig({ activeTab: 'details' });
        fixture.detectChanges();
        expect(component.activeTabKey).toBe('details');

        component.config = buildConfig({ activeTab: 'history' });
        fixture.detectChanges();
        expect(component.activeTabKey).toBe('history');
    });
});

function buildConfig(overrides?: Partial<TabsConfig> & { tabs?: Tab[]; onTabChange?: (key: string) => void; activeTab?: string }): TabsConfig {
    return new TabsConfig({
        activeTab: overrides?.activeTab,
        onTabChange: overrides?.onTabChange,
        prefix: overrides?.prefix ?? 'test.tabs',
        tabs: overrides?.tabs ?? [
            new Tab({ key: 'general' }),
            new Tab({ key: 'details' }),
            new Tab({ key: 'history' })
        ]
    });
}
