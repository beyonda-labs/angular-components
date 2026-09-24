import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbConfig } from '../breadcrumb/models/breadcrumb.model';
import { FooterComponent } from '../footer/footer.component';
import { LeftMenuComponent } from '../left-menu/left-menu.component';
import { LeftMenuAction, LeftMenuConfig } from '../left-menu/models/left-menu.model';
import { AppLayoutBreadcrumbItem, AppLayoutConfig } from './models/app-layout.model';
import { AppLayoutService } from './services/app-layout.service';

function findPathByKey(
    actions: LeftMenuAction[],
    key: string,
    parents: LeftMenuAction[] = []
): LeftMenuAction[] | null {
    for (const action of actions) {
        if (action.key === key) {
            return [...parents, action];
        }

        const nested = findPathByKey(action.subActions, key, [...parents, action]);

        if (nested) {
            return nested;
        }
    }

    return null;
}

function findPathByUrl(
    actions: LeftMenuAction[],
    path: string,
    parents: LeftMenuAction[] = []
): LeftMenuAction[] | null {
    let best: LeftMenuAction[] | null = null;

    for (const action of actions) {
        const current = [...parents, action];
        const matches = Boolean(action.route) && (path === action.route || path.startsWith(`${action.route}/`));
        const nested = findPathByUrl(action.subActions, path, current);
        const candidate = nested ?? (matches ? current : null);

        if (candidate && (!best || candidate.length > best.length)) {
            best = candidate;
        }
    }

    return best;
}

function hasRoutes(actions: LeftMenuAction[]): boolean {
    return actions.some(action => Boolean(action.route) || hasRoutes(action.subActions));
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, FooterComponent, LeftMenuComponent, TranslateModule],
    selector: 'bey-app-layout',
    standalone: true,
    styleUrls: ['./app-layout.component.css'],
    templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent implements OnInit {
    readonly config = input.required<AppLayoutConfig>();

    readonly breadcrumbConfig = computed(() => {
        const items = this.appLayoutService.breadcrumb();

        return items.length === 0
            ? null
            : new BreadcrumbConfig({
                  items,
                  onItemClick: (id: number) => this.config().onBreadcrumbClick?.(id),
                  translate: false
              });
    });
    readonly leftMenuConfig = computed(() => {
        const { bottomActions, prefix, title, topActions, userInfo } = this.config();
        const activeKey = this.appLayoutService.activeActionKey();

        return new LeftMenuConfig({
            bottomActions: this.prepareActions(bottomActions, activeKey),
            expanded: this.appLayoutService.expanded(),
            prefix,
            title,
            topActions: this.prepareActions(topActions, activeKey),
            userInfo
        });
    });
    readonly usesRoutes = computed(() => hasRoutes(this.allActions()));

    private readonly appLayoutService = inject(AppLayoutService);
    private readonly router = inject(Router);
    private readonly translateService = inject(TranslateService);

    constructor() {
        this.appLayoutService.onBreadcrumbClick$
            .pipe(takeUntilDestroyed())
            .subscribe(id => this.config().onBreadcrumbClick?.(id));
        this.appLayoutService.onMenuClick$.pipe(takeUntilDestroyed()).subscribe(key => {
            this.activateByKey(key);
            this.config().onMenuActionClick?.(key);
        });
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(event => this.activateByUrl((event as NavigationEnd).urlAfterRedirects));
        this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this.refreshActiveAction());
    }

    ngOnInit(): void {
        const { breadcrumb, onLayoutInitialized } = this.config();

        if (breadcrumb.length > 0) {
            this.appLayoutService.setBreadcrumb(breadcrumb);
        }

        onLayoutInitialized?.();
        this.activateByUrl(this.router.url);
    }

    onExpandedChange(value: boolean): void {
        this.appLayoutService.setExpanded(value);
    }

    private activate(path: LeftMenuAction[]): void {
        const leaf = path[path.length - 1];
        const { onRouteActivated, prefix } = this.config();
        const items = path.map(
            (action, index) =>
                new AppLayoutBreadcrumbItem({
                    id: index + 1,
                    label: this.translateService.instant(`${prefix}.actions.${action.key}.label`)
                })
        );

        this.appLayoutService.activeMenuAction(leaf.key);
        this.appLayoutService.setBreadcrumb(items);
        onRouteActivated?.(leaf.key);
    }

    private activateByKey(key: string): void {
        const path = findPathByKey(this.allActions(), key);

        if (path?.[path.length - 1].route) {
            this.activate(path);
        }
    }

    private activateByUrl(url: string): void {
        if (!this.usesRoutes()) {
            return;
        }

        const path = findPathByUrl(this.allActions(), url.split('?')[0].split('#')[0]);

        if (path) {
            this.activate(path);

            return;
        }

        this.appLayoutService.clearActiveAction();
        this.appLayoutService.clearBreadcrumb();
    }

    private allActions(): LeftMenuAction[] {
        const { bottomActions, topActions } = this.config();

        return [...topActions, ...bottomActions];
    }

    private prepareActions(actions: LeftMenuAction[], activeKey: string | null): LeftMenuAction[] {
        return actions.map(
            action =>
                new LeftMenuAction({
                    ...action,
                    action: () => {
                        action.action?.();
                        this.appLayoutService.emitMenuClick(action.key);
                    },
                    active: activeKey === null ? action.active : action.key === activeKey,
                    subActions: this.prepareActions(action.subActions, activeKey)
                })
        );
    }

    private refreshActiveAction(): void {
        const key = this.appLayoutService.activeActionKey();

        if (key !== null) {
            this.activateByKey(key);
        }
    }
}
