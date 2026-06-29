import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbConfig } from '../breadcrumb/models/breadcrumb.model';
import { FloatingPreferencesComponent } from '../floating-preferences/floating-preferences.component';
import { FooterComponent } from '../footer/footer.component';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { LeftMenuAction, LeftMenuConfig } from '../left-menu/models/left-menu.model';
import { AppLayoutBreadcrumbItem, AppLayoutConfig } from './models/app-layout.model';
import { AppLayoutService } from './services/app-layout.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, FloatingPreferencesComponent, FooterComponent, LeftMenuComponent, TranslateModule],
    selector: 'bey-app-layout',
    standalone: true,
    styleUrls: ['./app-layout.component.css'],
    templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent implements OnInit, OnDestroy {
    @Input({ required: true })
    set config(value: AppLayoutConfig) {
        this._config = value;
        this.leftMenuConfig = this.buildLeftMenuConfig(value);
        this.breadcrumbConfig = this.buildBreadcrumbConfig(this.config.breadcrumb);
    }
    get config(): AppLayoutConfig {
        return this._config;
    }

    breadcrumbConfig: BreadcrumbConfig | null = null;
    leftMenuConfig!: LeftMenuConfig;

    private _config!: AppLayoutConfig;
    private activeActionSubscription?: Subscription;
    private breadcrumbClickSubscription?: Subscription;
    private breadcrumbItemsSubscription?: Subscription;
    private langChangeSubscription?: Subscription;
    private menuClickSubscription?: Subscription;
    private routerSubscription?: Subscription;

    private currentActiveKey: string | null = null;

    private readonly appLayoutService = inject(AppLayoutService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly router = inject(Router);
    private readonly translateService = inject(TranslateService);

    ngOnInit(): void {
        this.breadcrumbItemsSubscription ??= this.appLayoutService.breadcrumbItems$.subscribe(items => {
            this.config.breadcrumb = items;
            this.breadcrumbConfig = this.buildBreadcrumbConfig(items);
            this.cdr.markForCheck();
        });
        this.breadcrumbClickSubscription ??= this.appLayoutService.onBreadcrumbClick$.subscribe(id => {
            this.config.onBreadcrumbClick?.(id);
        });
        this.menuClickSubscription ??= this.appLayoutService.onMenuClick$.subscribe(key => {
            this.activateByKey(key);
            this.config.onMenuActionClick?.(key);
        });
        this.activeActionSubscription ??= this.appLayoutService.activeAction$.subscribe(activeKey => {
            const allActions: LeftMenuAction[] = [
                ...this.leftMenuConfig.topActions,
                ...this.leftMenuConfig.bottomActions
            ];
            allActions.forEach(action => this.setActiveAction(action, activeKey));
            this.cdr.markForCheck();
        });

        this.config.onLayoutInitialized?.();

        if (this.usesRouteBased) {
            this.activateByUrl(this.router.url);
            this.routerSubscription = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe(event => this.activateByUrl((event as NavigationEnd).urlAfterRedirects));
            this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
                if (this.currentActiveKey !== null) {
                    this.activateByKey(this.currentActiveKey);
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.activeActionSubscription?.unsubscribe();
        this.breadcrumbClickSubscription?.unsubscribe();
        this.breadcrumbItemsSubscription?.unsubscribe();
        this.langChangeSubscription?.unsubscribe();
        this.menuClickSubscription?.unsubscribe();
        this.routerSubscription?.unsubscribe();
    }

    private get usesRouteBased(): boolean {
        const all = [...this.leftMenuConfig.topActions, ...this.leftMenuConfig.bottomActions];

        return this.anyActionHasRoute(all);
    }

    private anyActionHasRoute(actions: LeftMenuAction[]): boolean {
        return actions.some(a => Boolean(a.route) || (Boolean(a.subActions?.length) && this.anyActionHasRoute(a.subActions)));
    }

    private buildLeftMenuConfig(config: AppLayoutConfig): LeftMenuConfig {
        const { bottomActions, prefix, title, topActions, userInfo } = config;

        this.initActions(bottomActions);
        this.initActions(topActions);

        return new LeftMenuConfig({
            bottomActions,
            prefix,
            title,
            topActions,
            userInfo
        });
    }

    private buildBreadcrumbConfig(items: AppLayoutBreadcrumbItem[]): BreadcrumbConfig | null {
        if (items.length === 0) {
            return null;
        }

        return new BreadcrumbConfig({
            items,
            onItemClick: (id: number) => this.config.onBreadcrumbClick?.(id),
            translate: false
        });
    }

    private initActions(actions: LeftMenuAction[]): void {
        actions.forEach(action => {
            action.action = () => this.appLayoutService.emitMenuClick(action.key);
            if (action.subActions?.length) {
                this.initActions(action.subActions);
            }
        });
    }

    private setActiveAction(action: LeftMenuAction, activeKey: string): void {
        action.active = action.key === activeKey;

        if (action.subActions) {
            action.subActions.forEach(sub => this.setActiveAction(sub, activeKey));
        }
    }

    // Route-based activation — only used when at least one action declares `route`

    private activateByUrl(url: string): void {
        const path = url.split('?')[0].split('#')[0];
        const all = [...this.leftMenuConfig.topActions, ...this.leftMenuConfig.bottomActions];
        const breadcrumbPath = this.findBreadcrumbPathByUrl(all, path);

        if (breadcrumbPath?.length) {
            const leaf = breadcrumbPath[breadcrumbPath.length - 1];
            this.currentActiveKey = leaf.key;
            this.appLayoutService.activeMenuAction(leaf.key);
            this.buildAndSetBreadcrumb(breadcrumbPath);
            this.config.onRouteActivated?.(leaf.key);
        } else {
            this.currentActiveKey = null;
            this.appLayoutService.clearBreadcrumb();
        }
    }

    private activateByKey(key: string): void {
        const all = [...this.leftMenuConfig.topActions, ...this.leftMenuConfig.bottomActions];
        const breadcrumbPath = this.findBreadcrumbPathByKey(all, key);
        const leaf = breadcrumbPath?.[breadcrumbPath.length - 1];

        if (!leaf?.route) {return;}

        this.currentActiveKey = key;
        this.appLayoutService.activeMenuAction(key);
        this.buildAndSetBreadcrumb(breadcrumbPath!);
    }

    private buildAndSetBreadcrumb(path: LeftMenuAction[]): void {
        const items = path.map((action, index) =>
            new AppLayoutBreadcrumbItem({
                id: index + 1,
                label: this.translateService.instant(`${this.config.prefix}.actions.${action.key}.label`)
            })
        );

        this.appLayoutService.setBreadcrumb(items);
    }

    private findBreadcrumbPathByUrl(
        actions: LeftMenuAction[],
        path: string,
        parents: LeftMenuAction[] = []
    ): LeftMenuAction[] | null {
        let best: LeftMenuAction[] | null = null;

        for (const action of actions) {
            const matches =
                Boolean(action.route) && (path === action.route || path.startsWith(action.route + '/'));

            if (matches) {
                const current = [...parents, action];
                const sub = action.subActions?.length
                    ? this.findBreadcrumbPathByUrl(action.subActions, path, current)
                    : null;
                const candidate = sub ?? current;

                if (!best || candidate.length > best.length) {
                    best = candidate;
                }
            } else if (action.subActions?.length) {
                const sub = this.findBreadcrumbPathByUrl(action.subActions, path, [...parents, action]);

                if (sub && (!best || sub.length > best.length)) {
                    best = sub;
                }
            }
        }

        return best;
    }

    private findBreadcrumbPathByKey(
        actions: LeftMenuAction[],
        key: string,
        parents: LeftMenuAction[] = []
    ): LeftMenuAction[] | null {
        for (const action of actions) {
            if (action.key === key) {return [...parents, action];}

            if (action.subActions?.length) {
                const sub = this.findBreadcrumbPathByKey(action.subActions, key, [...parents, action]);
                if (sub) {return sub;}
            }
        }

        return null;
    }
}
