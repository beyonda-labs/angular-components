import { computed, Injectable, signal } from '@angular/core';

import { fromSharedRoot } from '../functions/page-breadcrumb';
import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageCategoryPathEntry, PageState } from '../models/page-state.model';
import { PageView } from '../models/page-view.model';

@Injectable()
export class PageViewService {
    private readonly _activeView = signal<PageView | null>(null);
    private readonly _categoryPath = signal<PageCategoryPathEntry[]>([]);
    private readonly _currentCategoryId = signal<string | number | null>(null);
    private readonly _viewMode = signal<PageViewMode>(PageViewMode.Table);

    readonly activeTab = computed(() => this._activeView()?.key ?? this._viewMode());
    readonly activeView = computed(() => this._activeView()?.key ?? null);
    readonly categoryPath = computed(() => (this.flatView() ? [] : this._categoryPath()));
    readonly currentCategory = computed<PageCategoryPathEntry | null>(() =>
        this.currentCategoryId() === null ? null : (this._categoryPath().at(-1) ?? null)
    );
    readonly currentCategoryId = computed(() => (this.flatView() ? null : this._currentCategoryId()));
    readonly flatView = computed<PageView | null>(() => {
        const view = this._activeView();

        return view?.baseUrl ? view : null;
    });
    readonly isAtSharedRoot = computed(
        () => this._viewMode() === PageViewMode.Shared && this._currentCategoryId() === null
    );
    readonly location = computed(() => `${this.activeTab()}:${this.currentCategoryId() ?? ''}`);
    readonly sharedRoot = computed<PageCategoryPathEntry | null>(() =>
        this._viewMode() === PageViewMode.Shared ? (this._categoryPath()[0] ?? null) : null
    );
    readonly viewMode = this._viewMode.asReadonly();

    enterCategory(
        path: PageCategoryPathEntry[],
        categoryId: string | number,
        sharedRootId: string | number | null
    ): void {
        this._categoryPath.set(sharedRootId === null ? path : fromSharedRoot(path, sharedRootId));
        this._currentCategoryId.set(categoryId);
    }

    goUpTo(depth: number): void {
        const path = depth <= 0 ? [] : this._categoryPath().slice(0, depth);

        this._categoryPath.set(path);
        this._currentCategoryId.set(path.at(-1)?.id ?? null);
    }

    restore(state: PageState, views: PageView[]): void {
        this._activeView.set(views.find(view => view.key === state.view) ?? null);
        this._categoryPath.set(state.categoryPath);
        this._currentCategoryId.set(state.currentCategoryId);
        this._viewMode.set(state.viewMode);
    }

    selectView(view: PageView | null, mode: PageViewMode): void {
        this._activeView.set(view);
        this.setViewMode(mode);
    }

    setViewMode(mode: PageViewMode): void {
        if ((this._viewMode() === PageViewMode.Shared) !== (mode === PageViewMode.Shared)) {
            this._categoryPath.set([]);
            this._currentCategoryId.set(null);
        }

        this._viewMode.set(mode);
    }

    sharedRootIdFor(category: PageItem): string | number | null {
        return this._viewMode() === PageViewMode.Shared ? (this._categoryPath()[0]?.id ?? category.id) : null;
    }

    toState(): Pick<PageState, 'categoryPath' | 'currentCategoryId' | 'view' | 'viewMode'> {
        return {
            categoryPath: this._categoryPath(),
            currentCategoryId: this._currentCategoryId(),
            view: this.activeView(),
            viewMode: this._viewMode()
        };
    }
}
