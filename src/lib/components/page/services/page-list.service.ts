import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, finalize, Observable, tap } from 'rxjs';

import { SearchFilter } from '../../search/models/search-filter.model';
import { TableSort } from '../../table/models/table.model';
import { buildColumnContext } from '../functions/page-columns';
import { withSearchText } from '../functions/page-search-text';
import { hasSortableColumn, toSearchSort } from '../functions/page-sort';
import { readViewFilters } from '../functions/page-tabs';
import { PageBackendResponse, PageConfig } from '../models/page.model';
import { PageFolderCount, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_INITIAL_SEARCH, PageSearch, SearchSort } from '../models/page-search.model';
import { PageColumnContext } from '../models/page-table.model';
import { PageHttpService } from './page-http.service';
import { PageSearchService } from './page-search.service';
import { PageViewService } from './page-view.service';

type QueryParameters = Record<string, string | number>;

interface PageLocatedCount extends PageFolderCount {
    location: string;
}

@Injectable()
export class PageListService {
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageSearchService = inject(PageSearchService);
    private readonly pageViewService = inject(PageViewService);

    private readonly _columnContext = signal<PageColumnContext>({ isSearching: false });
    private readonly _counted = signal<PageLocatedCount | null>(null);
    private readonly _globalActions = signal<string[] | null>(null);
    private readonly _items = signal<PageItem[]>([]);
    private readonly _loading = signal(false);
    private readonly _search = signal<PageSearch>(PAGE_INITIAL_SEARCH);
    private readonly _sentSearch = signal<PageSearch>(PAGE_INITIAL_SEARCH);
    private readonly _sort = signal<TableSort | null>(null);
    private readonly _totalItems = signal(0);

    readonly columnContext = this._columnContext.asReadonly();
    readonly folderCount = computed<PageFolderCount | null>(() => {
        const counted = this._counted();

        return counted?.location === this.pageViewService.location() ? counted : null;
    });
    readonly globalActions = this._globalActions.asReadonly();
    readonly items = this._items.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly search = this._search.asReadonly();
    readonly sentSearch = this._sentSearch.asReadonly();
    readonly sort = this._sort.asReadonly();
    readonly totalItems = this._totalItems.asReadonly();

    load(config: PageConfig, search: PageSearch): Observable<PageBackendResponse> {
        const { baseUrl } = config;

        if (!baseUrl) {
            return EMPTY;
        }

        const viewingTrash = this.pageViewService.viewMode() === PageViewMode.Trash;
        const location = this.pageViewService.location();
        const viewFilters = viewingTrash ? [] : readViewFilters(config, this.pageViewService.activeView());
        const sentSearch = { ...search, filters: [...viewFilters, ...search.filters] };
        const textField = config.tableConfig?.search?.textField;
        const queryParameters = {
            ...this.pageSearchService.buildQueryParameters(
                sentSearch,
                Boolean(config.tableConfig?.search) || viewFilters.length > 0 || hasSortableColumn(config),
                textField
            ),
            ...this.folderParameters(config)
        };
        const columnContext = buildColumnContext(
            sentSearch,
            textField,
            viewingTrash ? null : this.pageViewService.currentCategory()
        );

        this._sentSearch.set(withSearchText(sentSearch, textField));
        this._loading.set(true);

        return this.requestList(baseUrl, queryParameters).pipe(
            tap(response => {
                const total = response.search?.total ?? response.results.length;

                this._columnContext.set(columnContext);
                this._items.set(response.results);
                this._totalItems.set(total);
                this._counted.set({ categoryTotal: response.search?.categoryTotal, location, total });
                this._globalActions.set(response.globalActions ?? []);
            }),
            finalize(() => this._loading.set(false))
        );
    }

    refresh(): void {
        this._search.update(search => ({ ...search, page: 1 }));
    }

    restore(search: PageSearch, sort: TableSort | null): void {
        this._search.set(search);
        this._sort.set(sort);
    }

    setFilters(filters: SearchFilter[]): void {
        this._search.update(search => ({ ...search, filters, page: 1 }));
    }

    setOrder(order: SearchSort): void {
        this._search.update(search => ({ ...search, sort: order }));
    }

    setPage(page: number): void {
        this._search.update(search => ({ ...search, page }));
    }

    setPageSize(size: number): void {
        this._search.update(search => ({ ...search, page: 1, size }));
    }

    setSort(sort: TableSort | null, order?: SearchSort): void {
        this._sort.set(sort);
        this._search.update(search => ({ ...search, page: 1, sort: sort ? toSearchSort(sort) : order }));
    }

    private folderParameters({ tableConfig }: PageConfig): QueryParameters {
        const categoriesConfig = tableConfig?.categoriesConfig;
        const isFolderListed =
            this.pageViewService.viewMode() !== PageViewMode.Trash &&
            !this.pageViewService.flatView() &&
            !this.pageViewService.isAtSharedRoot();

        return categoriesConfig && isFolderListed
            ? { [categoriesConfig.parentField]: this.pageViewService.currentCategoryId() ?? 'null' }
            : {};
    }

    private requestList(baseUrl: string, queryParameters: QueryParameters): Observable<PageBackendResponse> {
        if (this.pageViewService.viewMode() === PageViewMode.Trash) {
            return this.pageHttpService.loadTrash(baseUrl, queryParameters);
        }

        if (this.pageViewService.isAtSharedRoot()) {
            return this.pageHttpService.loadShared(baseUrl, queryParameters);
        }

        return this.pageHttpService.load(this.pageViewService.flatView()?.baseUrl ?? baseUrl, queryParameters);
    }
}
