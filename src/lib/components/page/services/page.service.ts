import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, EMPTY, finalize, Observable, Subject, switchMap, tap } from 'rxjs';

import { BreadcrumbConfig, BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { HeaderConfig } from '../../header/models/header.model';
import { PAGINATION_SIZE_DEFAULT, PaginationConfig } from '../../pagination/models/pagination.model';
import { SearchConfig } from '../../search/models/search.model';
import { SearchFilter } from '../../search/models/search-filter.model';
import { TableConfig, TableSort } from '../../table/models/table.model';
import { TabsConfig } from '../../tabs/models/tabs.model';
import { buildPageBreadcrumbItems, fromSharedRoot } from '../functions/page-breadcrumb';
import { buildColumnContext, withColumnTooltips, withShownColumns } from '../functions/page-columns';
import { withFolderCount } from '../functions/page-folder-count';
import { readRowField } from '../functions/page-row';
import { findStandardMoveAction, isMoveDragAllowed, isMoveDropAllowed } from '../functions/page-row-drop';
import { buildPageSearchConfig } from '../functions/page-search-config';
import { hasSortableColumn, toSearchSort } from '../functions/page-sort';
import { buildPageTabs, readViewFilters } from '../functions/page-tabs';
import { PageBackendResponse, PageConfig, PageHandle } from '../models/page.model';
import { PageAction, PageActionZone } from '../models/page-action.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch } from '../models/page-search.model';
import { PageCategoryPathEntry } from '../models/page-state.model';
import { PageColumnContext } from '../models/page-table.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageOrganizationsService } from './page-organizations.service';
import { PageOwnersService } from './page-owners.service';
import { PageSearchService } from './page-search.service';
import { PageStateService } from './page-state.service';
import { PageTableService } from './page-table.service';

interface PageLoad {
    config: PageConfig;
    search: PageSearch;
}

const INITIAL_SEARCH: PageSearch = { filters: [], page: 1, size: PAGINATION_SIZE_DEFAULT };

@Injectable()
export class PageService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pageActionsService = inject(PageActionsService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageOrganizationsService = inject(PageOrganizationsService);
    private readonly pageOwnersService = inject(PageOwnersService);
    private readonly pageSearchService = inject(PageSearchService);
    private readonly pageStateService = inject(PageStateService);
    private readonly pageTableService = inject(PageTableService);

    private readonly columnContext = signal<PageColumnContext>({ isSearching: false });
    private readonly config = signal<PageConfig | null>(null);
    private readonly countedLocation = signal<string | null>(null);
    private formModalReference?: BsModalRef<ModalFormDialogComponent>;
    private readonly globalActions = signal<string[] | null>(null);
    private readonly loads = new Subject<PageLoad>();
    private readonly location = computed(() => `${this.activeTab()}:${this.currentCategoryId() ?? ''}`);
    private readonly statePath = this.pageStateService.currentPath();
    private readonly tableSort = signal<TableSort | null>(null);

    readonly activeTab = computed(() => this.activeView() ?? this.viewMode());
    readonly activeView = signal<string | null>(null);
    readonly categoryBreadcrumbConfig = computed<BreadcrumbConfig | null>(() => {
        const config = this.config();
        const viewMode = this.viewMode();

        return config?.tableConfig?.categoriesConfig
            ? new BreadcrumbConfig({
                  items: this.withCount(buildPageBreadcrumbItems(config.prefix, viewMode, this.categoryPath())),
                  onItemClick: viewMode === PageViewMode.Trash ? undefined : id => this.navigateBreadcrumb(id),
                  translate: false
              })
            : null;
    });
    readonly categoryPath = signal<PageCategoryPathEntry[]>([]);
    readonly currentCategoryId = signal<string | number | null>(null);
    readonly handle: PageHandle = {
        openCategory: item => this.openCategory(item),
        openEdit: row => this.openEdit(row),
        openForm: (config, submit) => this.openForm(config, submit),
        refresh: () => this.refresh(),
        selected: () => this.selected(),
        viewMode: () => this.viewMode()
    };
    readonly headerConfig = computed<HeaderConfig | null>(() => {
        const config = this.config();

        if (!config?.headerConfig) {
            return null;
        }

        const visible = this.visibleActions();
        const execute = (action: PageAction): void =>
            this.pageActionsService.executeAction(action, this.buildActionsContext(config));

        return new HeaderConfig({
            leftActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Left, execute),
            menuActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Menu, execute),
            prefix: config.prefix,
            rightActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Right, execute),
            title: config.headerConfig.title
        });
    });
    readonly items = signal<PageItem[]>([]);
    readonly loading = signal(false);
    readonly pageSearch = signal<PageSearch>(INITIAL_SEARCH);
    readonly paginationConfig = computed<PaginationConfig | null>(() => {
        const config = this.config();

        if (!config?.tableConfig?.showPagination || this.totalItems() === 0) {
            return null;
        }

        const search = this.pageSearch();

        return new PaginationConfig({
            onPageChange: page => this.pageSearch.update(current => ({ ...current, page })),
            onPageSizeChange: size => this.pageSearch.update(current => ({ ...current, page: 1, size })),
            page: search.page,
            pageSize: search.size,
            totalItems: this.totalItems()
        });
    });
    readonly searchConfig = computed<SearchConfig | null>(() => {
        const config = this.config();

        return config
            ? buildPageSearchConfig(config, {
                  filters: untracked(() => this.pageSearch().filters),
                  onFiltersChange: filters => this.setFilters(filters),
                  onPanelOpen: () => {
                      this.pageOrganizationsService.load(config);
                      this.pageOwnersService.load(config);
                  },
                  organizations: this.pageOrganizationsService.organizationsOf(config),
                  owners: this.pageOwnersService.ownersOf(config)
              })
            : null;
    });
    readonly selected = signal<PageItem[]>([]);
    readonly tableConfig = computed<TableConfig<PageItem> | null>(() => {
        const config = this.config();
        const pageTable = config?.tableConfig;

        if (!config || !pageTable) {
            return null;
        }

        const tablePrefix = `${config.prefix}.table`;
        const { categoriesConfig, isColumnShown } = pageTable;
        const moveAction = findStandardMoveAction(config.headerConfig?.actions ?? []);
        const canMoveByDrop = Boolean(config.baseUrl) && this.viewMode() !== PageViewMode.Trash;
        const dropMove = moveAction && categoriesConfig && canMoveByDrop ? { categoriesConfig, moveAction } : null;
        const columns = this.pageOrganizationsService.withoutHidden(config, pageTable.columns);
        const columnContext = this.columnContext();
        const shown = <T>(entries: T[]): T[] => withShownColumns(entries, columns, columnContext, isColumnShown);

        return new TableConfig<PageItem>({
            columns: withColumnTooltips(shown(columns), tablePrefix),
            height: pageTable.height,
            isDropAllowed: dropMove
                ? (target, items) => isMoveDropAllowed(dropMove.moveAction, target, items, dropMove.categoriesConfig)
                : undefined,
            isRowDraggable: dropMove
                ? item => isMoveDragAllowed(dropMove.moveAction, item, dropMove.categoriesConfig)
                : undefined,
            isRowSelected: item => this.selected().some(selected => selected.id === item.id),
            items: this.items(),
            loadRow: item =>
                shown(
                    this.pageOrganizationsService.withoutHidden(
                        config,
                        this.pageTableService.loadRow(config, item, this.viewMode(), category =>
                            this.openCategory(category)
                        )
                    )
                ),
            onRowDrop: dropMove
                ? (target, items) =>
                      this.pageActionsService.moveItems(this.buildActionsContext(config), items, target.id)
                : undefined,
            onSortChange: sort => this.setSort(sort),
            prefix: tablePrefix,
            selectable: pageTable.allowSelection,
            selectedItemsChange: items => this.setSelected(items),
            sort: this.tableSort() ?? undefined,
            storageKey: pageTable.storageKey
        });
    });
    readonly totalItems = signal(0);
    readonly viewMode = signal<PageViewMode>(PageViewMode.Table);
    readonly viewToggleConfig = computed<TabsConfig | null>(() => {
        const config = this.config();

        return config ? buildPageTabs(config, this.activeTab(), key => this.selectTab(key)) : null;
    });
    readonly visibleActions = computed<PageAction[]>(() =>
        this.pageActionsService.filterVisibleActions(
            this.config()?.headerConfig?.actions ?? [],
            this.globalActions(),
            this.selected(),
            this.config()?.tableConfig?.categoriesConfig
        )
    );

    constructor() {
        this.loads
            .pipe(
                switchMap(({ config, search }) => this.load(config, search)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();

        effect(() => {
            const config = this.config();
            const search = this.pageSearch();

            if (config) {
                untracked(() => this.loads.next({ config, search }));
            }
        });

        this.destroyRef.onDestroy(() => this.formModalReference?.hide());
        this.destroyRef.onDestroy(() => this.saveState());
    }

    navigateBreadcrumb(id: number): void {
        const path = id <= 0 ? [] : this.categoryPath().slice(0, id);

        this.categoryPath.set(path);
        this.currentCategoryId.set(path[path.length - 1]?.id ?? null);
        this.selected.set([]);
        this.refresh();
    }

    openCategory(item: PageItem): void {
        const config = this.config();
        const categoriesConfig = config?.tableConfig?.categoriesConfig;

        if (!config?.baseUrl || !categoriesConfig) {
            return;
        }

        const sharedRootId = this.viewMode() === PageViewMode.Shared ? (this.categoryPath()[0]?.id ?? item.id) : null;

        this.pageHttpService.loadCategoryPath(config.baseUrl, item.id).subscribe(path => {
            const entries = path.map(ancestor => ({
                id: ancestor.id,
                label: String(readRowField(ancestor, categoriesConfig.nameField) ?? '')
            }));

            this.categoryPath.set(sharedRootId === null ? entries : fromSharedRoot(entries, sharedRootId));
            this.currentCategoryId.set(item.id);
            this.selected.set([]);
            this.refresh();
        });
    }

    openEdit(row: PageItem): void {
        const config = this.config();

        if (config) {
            this.pageActionsService.openEditForm(this.buildActionsContext(config), row);
        }
    }

    openForm<TValue>(config: ModalFormConfig<TValue>, submit: (value: TValue) => Observable<unknown>): void {
        this.pageActionsService.openRequestForm(config, submit, () => this.refresh());
    }

    refresh(): void {
        this.pageSearch.update(search => ({ ...search, page: 1 }));
    }

    selectTab(key: string): void {
        const view = this.config()?.views.find(current => current.key === key);

        this.activeView.set(view?.key ?? null);
        this.setViewMode(view ? PageViewMode.Table : (key as PageViewMode));
    }

    setConfig<TValue, TItem extends PageItem, TCategory extends PageItem, TCategoryValue>(
        typedConfig: PageConfig<TValue, TItem, TCategory, TCategoryValue>
    ): void {
        const config = typedConfig as unknown as PageConfig;
        const isFirstConfig = this.config() === null;

        this.config.set(config);

        if (config.tableConfig?.order) {
            const { order } = config.tableConfig;

            this.pageSearch.update(search => ({ ...search, sort: order }));
        }

        if (isFirstConfig) {
            this.restoreState(config);
        }

        this.pageOrganizationsService.loadForPage(config, this.pageSearch().filters);
        config.onReady?.(this.handle);
    }

    setFilters(filters: SearchFilter[]): void {
        this.pageSearch.update(search => ({ ...search, filters, page: 1 }));
    }

    setSelected(items: PageItem[]): void {
        this.selected.set(items);
        this.config()?.tableConfig?.onSelectionChange?.(items);
    }

    setSort(sort: TableSort | null): void {
        const order = this.config()?.tableConfig?.order;

        this.tableSort.set(sort);
        this.pageSearch.update(search => ({ ...search, page: 1, sort: sort ? toSearchSort(sort) : order }));
    }

    setViewMode(mode: PageViewMode): void {
        if ((this.viewMode() === PageViewMode.Shared) !== (mode === PageViewMode.Shared)) {
            this.categoryPath.set([]);
            this.currentCategoryId.set(null);
        }

        this.viewMode.set(mode);
        this.selected.set([]);
        this.refresh();
    }

    private buildActionsContext(config: PageConfig): PageActionsContext {
        const clearAndRefresh = (): void => {
            this.selected.set([]);
            this.refresh();
        };

        const keepModal = (reference: BsModalRef<ModalFormDialogComponent>): void => {
            this.formModalReference = reference;
        };

        return {
            config,
            getCurrentCategory: () => this.currentCategory(),
            getCurrentCategoryId: () => this.currentCategoryId(),
            getSharedRoot: () => (this.viewMode() === PageViewMode.Shared ? (this.categoryPath()[0] ?? null) : null),
            onCategoryDeleted: clearAndRefresh,
            onCategoryFormModalOpened: keepModal,
            onCategorySaved: () => this.refresh(),
            onDeleted: clearAndRefresh,
            onFormModalOpened: keepModal,
            onMoved: clearAndRefresh,
            onSaved: () => this.refresh(),
            onTrashItemDeleted: clearAndRefresh,
            selectedItems: () => this.selected()
        };
    }

    private currentCategory(): PageCategoryPathEntry | null {
        const path = this.categoryPath();

        return this.currentCategoryId() === null ? null : (path[path.length - 1] ?? null);
    }

    private isAtSharedRoot(): boolean {
        return this.viewMode() === PageViewMode.Shared && this.currentCategoryId() === null;
    }

    private load(config: PageConfig, search: PageSearch): Observable<PageBackendResponse> {
        const { baseUrl } = config;

        if (!baseUrl) {
            return EMPTY;
        }

        const categoriesConfig = config.tableConfig?.categoriesConfig;
        const viewingTrash = this.viewMode() === PageViewMode.Trash;
        const location = this.location();
        const viewFilters = viewingTrash ? [] : readViewFilters(config, this.activeView());
        const sentSearch = { ...search, filters: [...viewFilters, ...search.filters] };
        const textField = config.tableConfig?.search?.textField;
        const queryParameters = this.pageSearchService.buildQueryParameters(
            sentSearch,
            Boolean(config.tableConfig?.search) || viewFilters.length > 0 || hasSortableColumn(config),
            textField
        );
        const columnContext = buildColumnContext(sentSearch, textField, viewingTrash ? null : this.currentCategory());

        if (categoriesConfig && !viewingTrash && !this.isAtSharedRoot()) {
            queryParameters[categoriesConfig.parentField] = this.currentCategoryId() ?? 'null';
        }

        this.loading.set(true);

        return this.requestList(baseUrl, queryParameters).pipe(
            tap(response => {
                this.columnContext.set(columnContext);
                this.items.set(response.results);
                this.totalItems.set(response.search?.total ?? response.results.length);
                this.countedLocation.set(location);
                this.globalActions.set(response.globalActions ?? []);
                this.restoreSelection();
                config.onDataLoaded?.(response);
            }),
            catchError(() => EMPTY),
            finalize(() => this.loading.set(false))
        );
    }

    private requestList(
        baseUrl: string,
        queryParameters: Record<string, string | number>
    ): Observable<PageBackendResponse> {
        if (this.viewMode() === PageViewMode.Trash) {
            return this.pageHttpService.loadTrash(baseUrl, queryParameters);
        }

        return this.isAtSharedRoot()
            ? this.pageHttpService.loadShared(baseUrl, queryParameters)
            : this.pageHttpService.load(baseUrl, queryParameters);
    }

    private restoreSelection(): void {
        const ids = new Set(this.selected().map(item => item.id));

        this.setSelected(this.items().filter(item => ids.has(item.id)));
    }

    private restoreState(config: PageConfig): void {
        const state = this.pageStateService.restore(this.statePath, config.prefix);

        if (!state) {
            return;
        }

        this.activeView.set(config.views.some(view => view.key === state.view) ? state.view : null);
        this.categoryPath.set(state.categoryPath);
        this.currentCategoryId.set(state.currentCategoryId);
        this.pageSearch.set(state.search);
        this.pageOwnersService.loadWhenFiltered(config, state.search.filters);
        this.selected.set(state.selected);
        this.tableSort.set(state.sort);
        this.viewMode.set(state.viewMode);
    }

    private saveState(): void {
        const config = this.config();

        if (config) {
            this.pageStateService.leave(this.statePath, config.prefix, {
                categoryPath: this.categoryPath(),
                currentCategoryId: this.currentCategoryId(),
                search: this.pageSearch(),
                selected: this.selected(),
                sort: this.tableSort(),
                view: this.activeView(),
                viewMode: this.viewMode()
            });
        }
    }

    private withCount(items: BreadcrumbItem[]): BreadcrumbItem[] {
        return this.countedLocation() === this.location() ? withFolderCount(items, this.totalItems()) : items;
    }
}
