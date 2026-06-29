import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LeftMenuComponent } from './left-menu.component';
import { LeftMenuAction, LeftMenuConfig, LeftMenuTitle, LeftMenuUserInfo } from './models/left-menu.model';

describe('LeftMenuComponent', () => {
    let component: LeftMenuComponent;
    let fixture: ComponentFixture<LeftMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LeftMenuComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should sync expanded state from config input', () => {
        component.config = buildConfig({ expanded: false });

        expect(component.expanded).toBe(false);
        expect(component.config.expanded).toBe(false);
    });

    it('should return top and bottom actions from config', () => {
        const topAction = new LeftMenuAction({ key: 'dashboard' });
        const bottomAction = new LeftMenuAction({ key: 'support' });
        component.config = buildConfig({
            bottomActions: [bottomAction],
            topActions: [topAction]
        });

        expect(component.topActions).toEqual([topAction]);
        expect(component.bottomActions).toEqual([bottomAction]);
    });

    it('should fallback title text to prefix when title uses default placeholder', () => {
        component.config = buildConfig({
            prefix: 'demo.left-menu',
            title: new LeftMenuTitle({ title: 'title' })
        });

        expect(component.getTitleText()).toBe('demo.left-menu.title');
    });

    it('should return configured title styles and title text', () => {
        component.config = buildConfig({
            title: new LeftMenuTitle({ styles: 'fw-bold text-uppercase', title: 'custom.title' })
        });

        expect(component.getTitleClasses()).toBe('fw-bold text-uppercase');
        expect(component.getTitleText()).toBe('custom.title');
    });

    it('should resolve user full name and prefer email for tooltip', () => {
        component.config = buildConfig({
            userInfo: new LeftMenuUserInfo({
                email: 'ada@example.com',
                name: 'Ada',
                surname: 'Lovelace'
            })
        });

        expect(component.getUserFullName()).toBe('Ada Lovelace');
        expect(component.getUserTooltip()).toBe('ada@example.com');
    });

    it('should fallback user tooltip to full name when email is missing', () => {
        component.config = buildConfig({
            userInfo: new LeftMenuUserInfo({
                name: 'Ada',
                surname: 'Lovelace'
            })
        });

        expect(component.getUserTooltip()).toBe('Ada Lovelace');
    });

    it('should return the correct toggle tooltip for each state', () => {
        component.config = buildConfig({ expanded: true });

        expect(component.getToggleTooltip()).toBe('angular-components.left-menu.collapse');

        component.expanded = false;

        expect(component.getToggleTooltip()).toBe('angular-components.left-menu.expand');
    });

    it('should toggle expanded state and persist it into config', () => {
        component.config = buildConfig({ expanded: true });

        component.toggleExpanded();

        expect(component.expanded).toBe(false);
        expect(component.config.expanded).toBe(false);
    });
});

function buildConfig(overrides?: Partial<LeftMenuConfig>): LeftMenuConfig {
    return new LeftMenuConfig({
        bottomActions: overrides?.bottomActions ?? [],
        expanded: overrides?.expanded ?? true,
        prefix: overrides?.prefix ?? 'test.left-menu',
        title:
            overrides?.title ??
            new LeftMenuTitle({
                icon: 'icon.svg',
                styles: '',
                title: 'test.left-menu.title'
            }),
        topActions: overrides?.topActions ?? [],
        userInfo: overrides?.userInfo
    });
}
