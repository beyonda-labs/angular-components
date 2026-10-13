import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, filter, ignoreElements, map, merge, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { buildCategoryPath } from '../functions/page-breadcrumb';
import { readPageLink, withoutPageLink } from '../functions/page-link';
import { PageConfig } from '../models/page.model';
import { PageItem } from '../models/page-item.model';
import { PageLink } from '../models/page-link.model';
import { PAGE_INITIAL_SEARCH } from '../models/page-search.model';
import { PageState } from '../models/page-state.model';
import { PageHttpService } from './page-http.service';
import { PageStateService } from './page-state.service';

interface PageLinkedFolder {
    config: PageConfig;
    folderId: string;
    state: PageState;
}

@Injectable()
export class PageLinkService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageStateService = inject(PageStateService);
    private readonly router = inject(Router);

    private readonly _isPending = signal(false);
    private readonly folders = new Subject<PageLinkedFolder>();
    private readonly path = this.pageStateService.currentPath();
    private readonly states = new Subject<PageState>();

    readonly isPending = this._isPending.asReadonly();

    follow(config: PageConfig): void {
        const tree = this.router.parseUrl(this.router.url);
        const link = readPageLink(tree.queryParams, config);

        if (!link || this.pageStateService.currentPath() !== this.path) {
            return;
        }

        const state = toLinkState(link, config);

        tree.queryParams = withoutPageLink(tree.queryParams);
        this.router.navigateByUrl(tree, { replaceUrl: true });
        this.states.next(state);

        if (link.folderId !== null) {
            this._isPending.set(true);
            this.folders.next({ config, folderId: link.folderId, state });
        }
    }

    watch(config: () => PageConfig | null): Observable<PageState> {
        const navigations = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            tap(() => {
                const current = config();

                if (current) {
                    this.follow(current);
                }
            }),
            ignoreElements()
        );
        const folders = this.folders.pipe(switchMap(folder => this.openFolder(folder)));

        return merge(this.states, navigations, folders).pipe(takeUntilDestroyed(this.destroyRef));
    }

    private openFolder({ config, folderId, state }: PageLinkedFolder): Observable<PageState> {
        const nameField = config.tableConfig?.categoriesConfig?.nameField ?? '';

        return this.pageHttpService.loadCategoryPathQuietly(config.baseUrl ?? '', folderId).pipe(
            map(path => (isPathTo(path, folderId) ? buildCategoryPath(path, nameField) : [])),
            catchError(() => of([])),
            map(categoryPath => {
                this._isPending.set(false);

                return { ...state, categoryPath, currentCategoryId: categoryPath.at(-1)?.id ?? null };
            })
        );
    }
}

function isPathTo(path: PageItem[], folderId: string): boolean {
    const folder = path.at(-1);

    return folder !== undefined && String(folder.id) === folderId;
}

function toLinkState({ view, viewMode }: PageLink, config: PageConfig): PageState {
    return {
        categoryPath: [],
        currentCategoryId: null,
        search: { ...PAGE_INITIAL_SEARCH, sort: config.tableConfig?.order },
        selected: [],
        sort: null,
        view,
        viewMode
    };
}
