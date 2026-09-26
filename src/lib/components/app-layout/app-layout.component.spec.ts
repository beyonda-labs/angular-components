import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { faGear, faHome } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
        fixture = TestBed.createComponent(AppLayoutComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function buttonOf(name: string): HTMLButtonElement {
        const found = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')].find(
            button => button.textContent?.trim() === name
        );

        if (!found) {
            throw new Error(`No button for ${name}`);
        }

        return found;
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
        return [
            ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
                'bey-breadcrumb li:not([aria-hidden="true"])'
            )
        ].map(item => item.textContent?.trim() ?? '');
    }

    beforeEach(async () => {
        localStorage.clear();
        global.ResizeObserver = class {
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        } as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [AppLayoutComponent, HostComponent, TranslateModule.forRoot()],
            providers: [provideRouter([{ path: '**', component: EmptyPageComponent }])]
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

    describe('breadcrumb', () => {
        it('shows nothing until the service has items, and hides again when they are cleared', async () => {
            await render();
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();

            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' })]);
            await settle();
            expect(breadcrumbLabels()).toEqual(['Home']);

            service.clearBreadcrumb();
            await settle();
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
        });

        it('starts with the items the config carries', async () => {
            await render(buildConfig({ breadcrumb: [new AppLayoutBreadcrumbItem({ id: 1, label: 'Start' })] }));
            await settle();

            expect(breadcrumbLabels()).toEqual(['Start']);
        });

        it('reports a click on an item, from the bar or from the service', async () => {
            const onBreadcrumbClick = jest.fn();
            await render(buildConfig({ onBreadcrumbClick }));
            service.setBreadcrumb([
                new AppLayoutBreadcrumbItem({ id: 1, label: 'Home' }),
                new AppLayoutBreadcrumbItem({ id: 2, label: 'Current' })
            ]);
            await settle();

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
            await settle();
            buttonOf('demo.actions.daily.label').click();
            buttonOf('demo.actions.settings.label').click();

            expect(clicked.mock.calls).toEqual([['daily'], ['settings']]);
        });

        it('never writes into the actions the consumer gave', async () => {
            const run = jest.fn();
            const action = new AppLayoutTopAction({ action: run, icon: faHome, key: 'home' });
            await render(buildConfig({ topActions: [action] }));

            service.activeMenuAction('home');
            await settle();

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
            await settle();

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
            await settle();

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
            await settle();

            expect(buttonOf('demo.actions.daily.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.reports.label', 'demo.actions.daily.label']);
            expect(onRouteActivated).toHaveBeenCalledWith('daily');
        });

        it('follows navigation, and clears everything on a url no action claims', async () => {
            await render(buildConfig({ topActions: routed() }));
            const router = TestBed.inject(Router);

            await router.navigateByUrl('/home');
            await settle();
            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.home.label']);

            await router.navigateByUrl('/elsewhere');
            await settle();
            expect(service.activeActionKey()).toBeNull();
            expect(fixture.nativeElement.querySelector('bey-breadcrumb')).toBeNull();
        });

        it('activates a routed action when it is used from the menu', async () => {
            await render(buildConfig({ topActions: routed() }));

            buttonOf('demo.actions.home.label').click();
            await settle();

            expect(buttonOf('demo.actions.home.label').getAttribute('aria-current')).toBe('page');
            expect(breadcrumbLabels()).toEqual(['demo.actions.home.label']);
        });

        it('rebuilds the breadcrumb in the new language', async () => {
            const translate = TestBed.inject(TranslateService);
            await TestBed.inject(Router).navigateByUrl('/home');
            await render(buildConfig({ topActions: routed() }));

            translate.setTranslation('es', { demo: { actions: { home: { label: 'Inicio' } } } });
            translate.use('es');
            await settle();

            expect(breadcrumbLabels()).toEqual(['Inicio']);
        });

        it('leaves the service alone when no action declares a route', async () => {
            await render();
            service.setBreadcrumb([new AppLayoutBreadcrumbItem({ id: 1, label: 'Kept' })]);

            await TestBed.inject(Router).navigateByUrl('/anywhere');
            await settle();

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
