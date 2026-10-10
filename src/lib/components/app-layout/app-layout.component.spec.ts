import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { faGear, faHome } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { config as rxjsConfig } from 'rxjs';

import { LeftMenuTitle, LeftMenuUserInfo } from '../left-menu/models/left-menu.model';
import { AppLayoutComponent } from './app-layout.component';
import {
    AppLayoutBottomAction,
    AppLayoutBreadcrumbItem,
    AppLayoutConfig,
    AppLayoutConfigParameters,
    AppLayoutTopAction
} from './models/app-layout.model';
import { AppLayoutService } from './services/app-layout.service';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, template: '' })
class EmptyPageComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AppLayoutComponent],
    standalone: true,
    template: '<bey-app-layout [config]="config"><p>Projected content</p></bey-app-layout>'
})
class HostComponent {
    config = buildConfig();
}

function buildConfig(overrides: Partial<AppLayoutConfigParameters> = {}): AppLayoutConfig {
    return new AppLayoutConfig({
        iconSrc: 'icon.svg',
        prefix: 'demo',
        productName: 'Demo product',
        title: new LeftMenuTitle({ title: 'Demo app' }),
        topActions: [new AppLayoutTopAction({ icon: faHome, key: 'home' })],
        bottomActions: [new AppLayoutBottomAction({ icon: faGear, key: 'settings' })],
        ...overrides
    });
}

describe('AppLayoutComponent', () => {
    let fixture: ComponentFixture<AppLayoutComponent>;
    let service: AppLayoutService;

    async function render(config: AppLayoutConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(AppLayoutComponent, { config });
    }

    function buttonOf(name: string): HTMLButtonElement {
        return buttonByName(fixture, name);
    }

    function chevronOf(name: string): HTMLElement {
        return buttonOf(name).querySelector(':scope > span[aria-hidden="true"]') as HTMLElement;
    }

    function toggle(): HTMLButtonElement {
        return fixture.nativeElement.querySelector(
            '[aria-label="angular-components.left-menu.collapse"], [aria-label="angular-components.left-menu.expand"]'
        );
    }

    function breadcrumbLabels(): string[] {
        return textsOf(queryAll(fixture, 'bey-breadcrumb li:not([aria-hidden="true"])'));
    }

    beforeEach(async () => {
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [AppLayoutComponent, HostComponent],
            providers: [provideRouter([{ path: '**', component: EmptyPageComponent }]), provideBeyTesting()]
        }).compileComponents();

        service = TestBed.inject(AppLayoutService);
    });

    it('shows the menu with the title and both action groups', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Demo app');
        expect(buttonOf('demo.actions.home.label')).toBeTruthy();
        expect(buttonOf('demo.actions.settings.label')).toBeTruthy();
    });

    it('projects the page content into the body', () => {
        const host = TestBed.createComponent(HostComponent);
        host.detectChanges();

        expect(host.nativeElement.querySelector('main').textContent).toContain('Projected content');
    });

    it('reports that it has initialised', async () => {
        const onLayoutInitialized = jest.fn();

        await render(buildConfig({ onLayoutInitialized }));

        expect(onLayoutInitialized).toHaveBeenCalledTimes(1);
    });

    it('passes the signed-in user to the menu', async () => {
        await render(buildConfig({ userInfo: new LeftMenuUserInfo({ name: 'Ada', surname: 'Lovelace' }) }));

        expect(fixture.nativeElement.querySelector('aside').textContent).toContain('Ada Lovelace');
    });

    it('passes the route of the signed-in user to the menu, which links to it', async () => {
        await render(
            buildConfig({ userInfo: new LeftMenuUserInfo({ name: 'Ada', route: '/account', surname: 'Lovelace' }) })
        );
        const link = queryAll<HTMLAnchorElement>(fixture, 'a').find(
            anchor => anchor.getAttribute('aria-label') === 'angular-components.left-menu.open-account'
        );

        expect(link?.getAttribute('href')).toBe('/account');
    });

    it('keeps the footer of a config copied with a spread, with the overrides of the copy', async () => {
        const original = buildConfig({ orgName: 'Acme', termsUrl: '/terms' });

        await render(new AppLayoutConfig({ ...original, productName: 'Copied product' }));

        expect(fixture.nativeElement.textContent).toContain('Acme');
        expect(fixture.nativeElement.textContent).toContain('Copied product');
        expect(buttonOf('angular-components.footer.terms')).toBeTruthy();
    });

    describe('breadcrumb', () => {
        it('shows nothing until the service has items, and hides again when they are cleared', async () => {
            await render();
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();

            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })]);
            await settle(fixture);
            expect(breadcrumbLabels()).toEqual(['Home']);

            service.clearBreadcrumb();
            await settle(fixture);
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
        });

        it('starts with the items the config carries', async () => {
            await render(buildConfig({ breadcrumb: [new AppLayoutBreadcrumbItem({ id: 1, label: 'Start' })] }));
            await settle(fixture);

            expect(breadcrumbLabels()).toEqual(['Start']);
        });

        it('reports a click on an item, from the bar or from the service', async () => {
            const onBreadcrumbClick = jest.fn();
            await render(buildConfig({ onBreadcrumbClick }));
            service.setBreadcrumb([
                new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
                new AppLayoutBreadcrumbItem({ id: 2, label: 'Current' })
            ]);
            await settle(fixture);

            buttonOf('Home').click();
            service.emitBreadcrumbClick(42);

            expect(onBreadcrumbClick.mock.calls).toEqual([[1], [42]]);
        });
    });

    describe('menu actions', () => {
        it('runs the consumer action, reports the key through the service and the config', async () => {
            const run = jest.fn();
            const onMenuActionClick = jest.fn();
            const clicked = jest.fn();
            await render(
                buildConfig({
                    onMenuActionClick,
                    topActions: [new AppLayoutTopAction({ action: run, icon: faHome, key: 'home' })]
                })
            );
            service.onMenuClick$.subscribe(clicked);

            buttonOf('demo.actions.home.label').click();

            expect(run).toHaveBeenCalled();
            expect(clicked).toHaveBeenCalledWith('home');
            expect(onMenuActionClick).toHaveBeenCalledWith('home');
        });

        it('reports a nested action and a bottom one alike', async () => {
            const clicked = jest.fn();
            await render(
                buildConfig({
                    topActions: [
                        new AppLayoutTopAction({
                            icon: faHome,
                            key: 'reports',
                            subActions: [new AppLayoutTopAction({ icon: faHome, key: 'daily' })]
                        })
                    ]
                })
            );
            service.onMenuClick$.subscribe(clicked);

            chevronOf('demo.actions.reports.label').click();
            await settle(fixture);
            buttonOf('demo.actions.daily.label').click();
            buttonOf('demo.actions.settings.label').click();

            expect(clicked.mock.calls).toEqual([['daily'], ['settings']]);
        });

        it('shows and runs actions that have no icon, nested ones included', async () => {
            const run = jest.fn();
            const clicked = jest.fn();
            await render(
                buildConfig({
                    bottomActions: [new AppLayoutBottomAction({ action: run, key: 'settings' })],
                    topActions: [
                        new AppLayoutTopAction({
                            key: 'reports',
                            subActions: [new AppLayoutTopAction({ key: 'daily' })]
                        })
                    ]
                })
            );
            service.onMenuClick$.subscribe(clicked);

            chevronOf('demo.actions.reports.label').click();
            await settle(fixture);
            buttonOf('demo.actions.daily.label').click();
            buttonOf('demo.actions.settings.label').click();

            expect(run).toHaveBeenCalled();
            expect(clicked.mock.calls).toEqual([['daily'], ['settings']]);
        });

        it('never writes into the actions the consumer gave', async () => {
            const run = jest.fn();
            const action = new AppLayoutTopAction({ action: run, icon: faHome, key: 'home' });
            await render(buildConfig({ topActions: [action] }));

            service.activeMenuAction('home');
            await settle(fixture);

            expect(action.action).toBe(run);
            expect(action.active).toBe(false);
        });
    });

    describe('active action', () => {
        it('honours the flag of the config until the service names one', async () => {
            await render(
                buildConfig({
                    topActions: [
                        new AppLayoutTopAction({ active: true, icon: faHome, key: 'home' }),
                        new AppLayoutTopAction({ icon: faGear, key: 'other' })
                    ]
                })
            );
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');

            service.activeMenuAction('other');
            await settle(fixture);

            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBeNull();
            expect(buttonOf('demo.actions.other.label').getAttribute('aria-current')).toBe('page');
        });
    });

    describe('expanded state', () => {
        it('starts as the service remembers and persists every toggle', async () => {
            service.setExpanded(false);
            await render();
            expect(toggle().getAttribute('aria-expanded')).toBe('false');

            toggle().click();
            await settle(fixture);

            expect(toggle().getAttribute('aria-expanded')).toBe('true');
            expect(service.expanded()).toBe(true);
            expect(localStorage.getItem('bey-left-menu-expanded')).toBe('true');
        });
    });

    describe('routes', () => {
        const routed = (): AppLayoutConfigParameters['topActions'] => [
            new AppLayoutTopAction({ icon: faHome, key: 'home', route: '/home' }),
            new AppLayoutTopAction({
                icon: faGear,
                key: 'reports',
                route: '/reports',
                subActions: [new AppLayoutTopAction({ icon: faGear, key: 'daily', route: '/reports/daily' })]
            })
        ];

        it('activates the action matching the current url and builds the breadcrumb from the path', async () => {
            const onRouteActivated = jest.fn();
            await TestBed.inject(Router).navigateByUrl('/reports/daily?tab=1');

            await render(buildConfig({ onRouteActivated, topActions: routed() }));
            await settle(fixture);

            expect(buttonOf('demo.actions.daily.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.reports.label', 'demo.actions.daily.label']);
            expect(onRouteActivated).toHaveBeenCalledWith('daily');
        });

        it('reads the breadcrumb and menu texts of a camelCase action key from its kebab-case segment', async () => {
            const onRouteActivated = jest.fn();
            await TestBed.inject(Router).navigateByUrl('/daily-reports');

            await render(
                buildConfig({
                    onRouteActivated,
                    topActions: [new AppLayoutTopAction({ icon: faGear, key: 'dailyReports', route: '/daily-reports' })]
                })
            );
            await settle(fixture);

            expect(buttonOf('demo.actions.daily-reports.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.daily-reports.label']);
            expect(onRouteActivated).toHaveBeenCalledWith('dailyReports');
        });

        it('follows navigation, and clears everything on a url no action claims', async () => {
            await render(buildConfig({ topActions: routed() }));
            const router = TestBed.inject(Router);

            await router.navigateByUrl('/home');
            await settle(fixture);
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.home.label']);

            await router.navigateByUrl('/elsewhere');
            await settle(fixture);
            expect(service.activeActionKey()).toBeNull();
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
        });

        it('navigates to the route of a top or bottom action used from the menu, and activates it', async () => {
            const router = TestBed.inject(Router);
            await render(
                buildConfig({
                    bottomActions: [new AppLayoutBottomAction({ icon: faGear, key: 'settings', route: '/settings' })],
                    topActions: routed()
                })
            );

            buttonOf('demo.actions.home.label').click();
            await settle(fixture);
            expect(router.url).toBe('/home');
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.home.label']);

            buttonOf('demo.actions.settings.label').click();
            await settle(fixture);
            expect(router.url).toBe('/settings');
            expect(buttonOf('demo.actions.settings.label').getAttribute('aria-current')).toBe('page');
        });

        it('runs the action of the consumer instead of navigating when an action has both', async () => {
            const router = TestBed.inject(Router);
            const run = jest.fn();
            const onMenuActionClick = jest.fn();
            await router.navigateByUrl('/start');
            await render(
                buildConfig({
                    onMenuActionClick,
                    topActions: [new AppLayoutTopAction({ action: run, icon: faHome, key: 'home', route: '/home' })]
                })
            );

            buttonOf('demo.actions.home.label').click();
            await settle(fixture);

            expect(run).toHaveBeenCalled();
            expect(onMenuActionClick).toHaveBeenCalledWith('home');
            expect(router.url).toBe('/start');
        });

        it('leaves a navigation that ends before its config arrives to the start, which activates the route', async () => {
            const previousHandler = rxjsConfig.onUnhandledError;
            const unhandled = jest.fn();

            rxjsConfig.onUnhandledError = unhandled;

            try {
                fixture = TestBed.createComponent(AppLayoutComponent);
                await TestBed.inject(Router).navigateByUrl('/home');
                fixture.componentRef.setInput('config', buildConfig({ topActions: routed() }));
                await settle(fixture);
                await new Promise(resolve => {
                    setTimeout(resolve);
                });
            } finally {
                rxjsConfig.onUnhandledError = previousHandler;
            }

            expect(unhandled).not.toHaveBeenCalled();
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
        });

        it('keeps the current page active when a guard cancels the navigation', async () => {
            const router = TestBed.inject(Router);
            router.resetConfig([
                { canActivate: [() => false], component: EmptyPageComponent, path: 'reports' },
                { component: EmptyPageComponent, path: '**' }
            ]);
            await router.navigateByUrl('/home');
            await render(buildConfig({ topActions: routed() }));

            buttonOf('demo.actions.reports.label').click();
            await settle(fixture);

            expect(router.url).toBe('/home');
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
            expect(buttonOf('demo.actions.reports.label').getAttribute('aria-current')).toBeNull();
            expect(breadcrumbLabels()).toEqual(['demo.actions.home.label']);
        });

        it('rebuilds the breadcrumb in the new language', async () => {
            const translate = TestBed.inject(TranslateService);
            await TestBed.inject(Router).navigateByUrl('/home');
            await render(buildConfig({ topActions: routed() }));

            translate.setTranslation('es', { demo: { actions: { home: { label: 'Inicio' } } } });
            translate.use('es');
            await settle(fixture);

            expect(breadcrumbLabels()).toEqual(['Inicio']);
        });

        it('activates the route but leaves the breadcrumb to the consumer when the route breadcrumb is off', async () => {
            const onRouteActivated = jest.fn();
            const router = TestBed.inject(Router);
            await router.navigateByUrl('/reports/daily');

            await render(
                buildConfig({
                    breadcrumb: [new AppLayoutBreadcrumbItem({ id: 1, label: 'Start' })],
                    isRouteBreadcrumbEnabled: false,
                    onRouteActivated,
                    topActions: routed()
                })
            );

            expect(buttonOf('demo.actions.daily.label').getAttribute('aria-current')).toBe('page');
            expect(onRouteActivated).toHaveBeenCalledWith('daily');
            expect(breadcrumbLabels()).toEqual(['Start']);

            await router.navigateByUrl('/elsewhere');
            await settle(fixture);

            expect(service.activeActionKey()).toBeNull();
            expect(breadcrumbLabels()).toEqual(['Start']);
        });

        it('keeps the breadcrumb and reports no activation on a language change when the route breadcrumb is off', async () => {
            const onRouteActivated = jest.fn();
            const translate = TestBed.inject(TranslateService);
            await TestBed.inject(Router).navigateByUrl('/home');
            await render(buildConfig({ isRouteBreadcrumbEnabled: false, onRouteActivated, topActions: routed() }));
            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Kept' })]);

            translate.setTranslation('es', { demo: { actions: { home: { label: 'Inicio' } } } });
            translate.use('es');
            await settle(fixture);

            expect(breadcrumbLabels()).toEqual(['Kept']);
            expect(onRouteActivated).toHaveBeenCalledTimes(1);
        });

        it('leaves the service alone when no action declares a route', async () => {
            await render();
            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Kept' })]);

            await TestBed.inject(Router).navigateByUrl('/anywhere');
            await settle(fixture);

            expect(breadcrumbLabels()).toEqual(['Kept']);
        });
    });

    it('stops listening once destroyed', async () => {
        const onMenuActionClick = jest.fn();
        await render(buildConfig({ onMenuActionClick }));

        fixture.destroy();
        service.emitMenuClick('home');

        expect(onMenuActionClick).not.toHaveBeenCalled();
    });
});
