import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faGear, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { LeftMenuTitle, LeftMenuUserInfo } from '../left-menu/models/left-menu.model';
import { AppLayoutComponent } from './app-layout.component';
import {
    AppLayoutBottomAction,
    AppLayoutBreadcrumbItem,
    AppLayoutConfig,
    AppLayoutTopAction
} from './models/app-layout.model';
import { AppLayoutService } from './services/app-layout.service';

class ResizeObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

@Component({
    standalone: true,
    imports: [AppLayoutComponent],
    template: '<bey-app-layout [config]="config"><p class="test-content">Projected content</p></bey-app-layout>'
})
class TestHostComponent {
    config!: AppLayoutConfig;
}

function buildConfig(
    overrides: {
        topActions?: AppLayoutTopAction[];
        bottomActions?: AppLayoutBottomAction[];
        onBreadcrumbClick?: (id: number) => void;
        onMenuActionClick?: (key: string) => void;
        onLayoutInitialized?: () => void;
    } = {}
): AppLayoutConfig {
    return new AppLayoutConfig({
        iconSrc: 'test-icon.svg',
        productName: 'Test Product',
        title: new LeftMenuTitle({ title: 'Test App' }),
        topActions: overrides.topActions ?? [],
        bottomActions: overrides.bottomActions ?? [],
        onBreadcrumbClick: overrides.onBreadcrumbClick,
        onMenuActionClick: overrides.onMenuActionClick,
        onLayoutInitialized: overrides.onLayoutInitialized
    });
}

describe('AppLayoutComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let service: AppLayoutService;

    beforeEach(async () => {
        global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()]
        }).compileComponents();

        service = TestBed.inject(AppLayoutService);
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
    });

    it('should create', () => {
        host.config = buildConfig();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('bey-left-menu')).toBeTruthy();
    });

    it('should render left-menu with provided config', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-left-menu')).toBeTruthy();
    });

    it('should project ng-content into body area', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        const projected = fixture.nativeElement.querySelector('.test-content');
        expect(projected).toBeTruthy();
        expect(projected.textContent).toBe('Projected content');
    });

    it('should hide breadcrumb when service has no items', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
    });

    it('should show breadcrumb when service has items', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        service.setBreadcrumb([
            new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
            new AppLayoutBreadcrumbItem({ id: 2, label: 'Products' })
        ]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeTruthy();
    });

    it('should hide breadcrumb after clearBreadcrumb', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })]);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeTruthy();

        service.clearBreadcrumb();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
    });

    it('should call config.onBreadcrumbClick with item id when a breadcrumb item is clicked', () => {
        const onBreadcrumbClick = jest.fn();
        host.config = buildConfig({ onBreadcrumbClick });
        fixture.detectChanges();

        service.setBreadcrumb([
            new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
            new AppLayoutBreadcrumbItem({ id: 2, label: 'Current' })
        ]);
        fixture.detectChanges();

        const buttons = fixture.nativeElement.querySelectorAll('.bey-breadcrumb-item-button');
        buttons[0]?.click();

        expect(onBreadcrumbClick).toHaveBeenCalledWith(1);
    });

    it('should call config.onBreadcrumbClick when service emits onBreadcrumbClick$', () => {
        const onBreadcrumbClick = jest.fn();
        host.config = buildConfig({ onBreadcrumbClick });
        fixture.detectChanges();

        service.emitBreadcrumbClick(42);

        expect(onBreadcrumbClick).toHaveBeenCalledWith(42);
    });

    it('should emit on onMenuClick$ when a top action is clicked', () => {
        const action = new AppLayoutTopAction({ key: 'dashboard', icon: faHome });
        host.config = buildConfig({ topActions: [action] });
        fixture.detectChanges();

        const spy = jest.fn();
        service.onMenuClick$.subscribe(spy);

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        component.leftMenuConfig.topActions[0].action?.();

        expect(spy).toHaveBeenCalled();
    });

    it('should emit on onMenuClick$ for bottom actions', () => {
        const action = new AppLayoutBottomAction({ key: 'settings', icon: faGear });
        host.config = buildConfig({ bottomActions: [action] });
        fixture.detectChanges();

        const spy = jest.fn();
        service.onMenuClick$.subscribe(spy);

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        component.leftMenuConfig.bottomActions[0].action?.();

        expect(spy).toHaveBeenCalled();
    });

    it('should emit on onMenuClick$ for nested sub-actions', () => {
        const subAction = new AppLayoutTopAction({ key: 'sub-item', icon: faUser });
        const parentAction = new AppLayoutTopAction({ key: 'parent', icon: faHome, subActions: [subAction] });
        host.config = buildConfig({ topActions: [parentAction] });
        fixture.detectChanges();

        const spy = jest.fn();
        service.onMenuClick$.subscribe(spy);

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        component.leftMenuConfig.topActions[0].subActions[0].action?.();

        expect(spy).toHaveBeenCalled();
    });

    it('should call config.onMenuActionClick when service emits onMenuClick$', () => {
        const onMenuActionClick = jest.fn();
        host.config = buildConfig({ onMenuActionClick });
        fixture.detectChanges();

        service.emitMenuClick('dashboard');

        expect(onMenuActionClick).toHaveBeenCalledWith('dashboard');
    });

    it('should call config.onLayoutInitialized on init', () => {
        const onLayoutInitialized = jest.fn();
        host.config = buildConfig({ onLayoutInitialized });
        fixture.detectChanges();

        expect(onLayoutInitialized).toHaveBeenCalledTimes(1);
    });

    it('should set active state on matching action via activeMenuAction', () => {
        const action = new AppLayoutTopAction({ key: 'dashboard', icon: faHome });
        host.config = buildConfig({ topActions: [action] });
        fixture.detectChanges();

        service.activeMenuAction('dashboard');
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.leftMenuConfig.topActions[0].active).toBe(true);
    });

    it('should set inactive state on non-matching actions via activeMenuAction', () => {
        const action1 = new AppLayoutTopAction({ key: 'dashboard', icon: faHome, active: true });
        const action2 = new AppLayoutTopAction({ key: 'settings', icon: faGear });
        host.config = buildConfig({ topActions: [action1, action2] });
        fixture.detectChanges();

        service.activeMenuAction('settings');
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.leftMenuConfig.topActions[0].active).toBe(false);
        expect(component.leftMenuConfig.topActions[1].active).toBe(true);
    });

    it('should build LeftMenuConfig with correct prefix and title', () => {
        host.config = new AppLayoutConfig({
            iconSrc: 'test-icon.svg',
            productName: 'Test Product',
            prefix: 'my-app',
            title: new LeftMenuTitle({ title: 'My Application', icon: '/logo.png' })
        });
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.leftMenuConfig.prefix).toBe('my-app');
        expect(component.leftMenuConfig.title.title).toBe('My Application');
        expect(component.leftMenuConfig.title.icon).toBe('/logo.png');
    });

    it('should build breadcrumb with translate disabled', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        service.setBreadcrumb([
            new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
            new AppLayoutBreadcrumbItem({ id: 2, label: 'Page' })
        ]);
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.breadcrumbConfig).toBeTruthy();
        expect(component.breadcrumbConfig!.translate).toBe(false);
    });

    it('should use breadcrumb item label correctly', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        service.setBreadcrumb([
            new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
            new AppLayoutBreadcrumbItem({ id: 2, label: 'Details' })
        ]);
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        const breadcrumbItems = component.breadcrumbConfig!.items;
        expect(breadcrumbItems[0].label).toBe('Home');
        expect(breadcrumbItems[1].label).toBe('Details');
    });

    it('should build LeftMenuAction with active state from AppLayoutTopAction', () => {
        const action = new AppLayoutTopAction({ key: 'dashboard', icon: faHome, active: true });
        host.config = buildConfig({ topActions: [action] });
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.leftMenuConfig.topActions[0].active).toBe(true);
    });

    it('should pass userInfo to LeftMenuConfig', () => {
        const userInfo = new LeftMenuUserInfo({ name: 'John', surname: 'Doe', email: 'john@test.com' });

        host.config = new AppLayoutConfig({
            iconSrc: 'test-icon.svg',
            productName: 'Test Product',
            title: new LeftMenuTitle({ title: 'App' }),
            userInfo
        });
        fixture.detectChanges();

        const component = fixture.debugElement.children[0].componentInstance as AppLayoutComponent;
        expect(component.leftMenuConfig.userInfo).toBe(userInfo);
    });

    it('should clean up subscriptions on destroy without errors', () => {
        host.config = buildConfig();
        fixture.detectChanges();

        fixture.destroy();

        expect(() => {
            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })]);
            service.emitBreadcrumbClick(1);
            service.emitMenuClick('key');
            service.activeMenuAction('key');
        }).not.toThrow();
    });
});
