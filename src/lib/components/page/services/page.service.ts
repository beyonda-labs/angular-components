import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

import { BreadcrumbConfig } from '../../breadcrumb/models/breadcrumb.model';
import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { HeaderConfig } from '../../header/models/header.model';
import { PaginationConfig } from '../../pagination/models/pagination.model';
import { SearchConfig } from '../../search/models/search.model';
import { SearchFilter } from '../../search/models/search-filter.model';
import { TableConfig, TableSort } from '../../table/models/table.model';
import { TableColumnsStorageService } from '../../table/services/table-columns-storage.service';
import { TabsConfig } from '../../tabs/models/tabs.model';
import {
    buildCategoryPath,
    buildFlatViewBreadcrumbItems,
    buildPageBreadcrumbItems
} from '../functions/page-breadcrumb';
import { withColumnTooltips, withShownColumns } from '../functions/page-columns';
import { withoutFolderActions } from '../functions/page-flat-view';
import { withFolderCount } from '../functions/page-folder-count';
import { buildRowDropOptions } from '../functions/page-row-drop';
import { buildPageSearchConfig } from '../functions/page-search-config';
import { withoutSharedRootMove } from '../functions/page-shared-root';
import { isPageSortShown } from '../functions/page-sort';
import { buildPageTabs } from '../functions/page-tabs';
import { PageActionsContext, PageBackendResponse, PageConfig, PageHandle } from '../models/page.model';
import { PageAction, PageActionZone } from '../models/page-action.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch } from '../models/page-search.model';
import { PageState } from '../models/page-state.model';
import { PageColumnContext } from '../models/page-table.model';
import { PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageLinkService } from './page-link.service';
import { PageListService } from './page-list.service';
import { PageOrganizationsService } from './page-organizations.service';
import { PageOwnersService } from './page-owners.service';
import { PageSelectionService } from './page-selection.service';
import { PageStateService } from './page-state.service';
import { PageTableService } from './page-table.service';
import { PageViewService } from './page-view.service';

interface PageLoad {
    config: PageConfig;
    search: PageSearch;
}

@Injectable()
export class PageService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pageActionsService = inject(PageActionsService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageLinkService = inject(PageLinkService);
    private readonly pageListService = inject(PageListService);
    private readonly pageOrganizationsService = inject(PageOrganizationsService);
    private readonly pageOwnersService = inject(PageOwnersService);
    private readonly pageSelectionService = inject(PageSelectionService);
    private readonly pageStateService = inject(PageStateService);
    private readonly pageTableService = inject(PageTableService);
    private readonly pageViewService = inject(PageViewService);
    private readonly tableColumnsStorageService = inject(TableColumnsStorageService);

    private readonly _config = signal<PageConfig | null>(null);
    private formModalReference?: BsModalRef<ModalFormDialogComponent>;
    private readonly loads = new Subject<PageLoad>();
    private readonly offeredActions = computed<PageAction[]>(() => {
        const actions = this._config()?.headerConfig?.actions ?? [];

        if (this.pageViewService.flatView()) {
            return withoutFolderActions(actions);
        }

        return this.pageViewService.isAtSharedRoot() ? withoutSharedRootMove(actions) : actions;
    });
    private readonly statePath = this.pageStateService.currentPath();
    private readonly visibleActions = computed<PageAction[]>(() =>
        this.pageActionsService.filterVisibleActions(
            this.offeredActions(),
            this.pageListService.globalActions(),
            this.pageSelectionService.selected(),
            this._config()?.tableConfig?.categoriesConfig
        )
    );

    readonly categoryBreadcrumbConfig = computed<BreadcrumbConfig | null>(() => {
        const config = this._config();
        const categoriesConfig = config?.tableConfig?.categoriesConfig;
        const flatView = this.pageViewService.flatView();
        const folderCount = this.pageListService.folderCount();
        const viewMode = this.pageViewService.viewMode();

        if (!config || !categoriesConfig) {
            return null;
        }

        const items = flatView
            ? buildFlatViewBreadcrumbItems(config.prefix, flatView)
            : buildPageBreadcrumbItems(config.prefix, viewMode, this.pageViewService.categoryPath());

        return new BreadcrumbConfig({
            items: folderCount ? withFolderCount(items, folderCount, categoriesConfig) : items,
            onItemClick: flatView || viewMode === PageViewMode.Trash ? undefined : id => this.navigateBreadcrumb(id),
            isTranslationKey: false
        });
    });
    readonly currentCategoryId = this.pageViewService.currentCategoryId;
    readonly handle: PageHandle = {
        openCategory: item => this.openCategory(item),
        openEdit: row => this.openEdit(row),
        openForm: (config, submit) => this.openForm(config, submit),
        refresh: () => this.refresh(),
        search: () => this.pageListService.sentSearch(),
        selected: () => this.pageSelectionService.selected(),
        viewMode: () => this.pageViewService.viewMode()
    };
    readonly headerConfig = computed<HeaderConfig | null>(() => {
        const config = this._config();

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
    readonly isLoading = this.pageListService.isLoading;
    readonly items = this.pageListService.items;
    readonly pageSearch = this.pageListService.search;
    readonly paginationConfig = computed<PaginationConfig | null>(() => {
        const config = this._config();
        const totalItems = this.pageListService.totalItems();

        if (!config?.tableConfig?.isPaginationShown || totalItems === 0) {
            return null;
        }

        const search = this.pageListService.search();

        return new PaginationConfig({
            onPageChange: page => this.pageListService.setPage(page),
            onPageSizeChange: size => this.pageListService.setPageSize(size),
            page: search.page,
            pageSize: search.size,
            totalItems
        });
    });
    readonly searchConfig = computed<SearchConfig | null>(() => {
        const config = this._config();

        return config
            ? buildPageSearchConfig(config, {
                  filters: untracked(() => this.pageListService.search().filters),
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
    readonly selected = this.pageSelectionService.selected;
    readonly tableConfig = computed<TableConfig<PageItem> | null>(() => {
        const config = this._config();
        const pageTable = config?.tableConfig;

        if (!config || !pageTable) {
            return null;
        }

        const tablePrefix = `${config.prefix}.table`;
        const { isColumnShown } = pageTable;
        const columns = this.pageOrganizationsService.withoutHidden(config, pageTable.columns);
        const columnContext = this.pageListService.columnContext();
        const shown = <T>(entries: T[]): T[] => withShownColumns(entries, columns, columnContext, isColumnShown);

        return new TableConfig<PageItem>({
            columns: withColumnTooltips(shown(columns), tablePrefix),
            ...buildRowDropOptions(config, this.offeredActions(), this.pageViewService.viewMode(), (target, items) =>
                this.pageActionsService.moveItems(this.buildActionsContext(config), items, target.id)
            ),
            height: pageTable.height,
            isRowSelected: item => this.pageSelectionService.isSelected(item),
            items: this.pageListService.items(),
            loadRow: item =>
                shown(
                    this.pageOrganizationsService.withoutHidden(
                        config,
                        this.pageTableService.loadRow(config, item, this.pageViewService.viewMode(), category =>
                            this.openCategory(category)
                        )
                    )
                ),
            onSortChange: sort => this.setSort(sort),
            prefix: tablePrefix,
            isSelectable: pageTable.canSelect,
            onSelectionChange: items => this.setSelected(items),
            sort: this.pageListService.sort() ?? undefined,
            storageKey: pageTable.storageKey
        });
    });
    readonly totalItems = this.pageListService.totalItems;
    readonly viewToggleConfig = computed<TabsConfig | null>(() => {
        const config = this._config();

        return config ? buildPageTabs(config, this.pageViewService.activeTab(), key => this.selectTab(key)) : null;
    });

    constructor() {
        this.loads
            .pipe(
                switchMap(({ config, search }) => this.load(config, search)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();

        this.pageLinkService.watch(() => this._config()).subscribe(state => this.restoreState(state));

        effect(() => {
            const config = this._config();
            const search = this.pageListService.search();

            if (config && !this.pageLinkService.isPending()) {
                untracked(() => this.loads.next({ config, search }));
            }
        });

        this.destroyRef.onDestroy(() => this.formModalReference?.hide());
        this.destroyRef.onDestroy(() => this.saveState());
    }

    navigateBreadcrumb(id: number): void {
        this.pageViewService.goUpTo(id);
        this.clearAndRefresh();
    }

    openCategory(item: PageItem): void {
        const config = this._config();
        const categoriesConfig = config?.tableConfig?.categoriesConfig;

        if (!config?.baseUrl || !categoriesConfig || this.pageViewService.flatView()) {
            return;
        }

        const sharedRootId = this.pageViewService.sharedRootIdFor(item);

        this.pageHttpService.loadCategoryPath(config.baseUrl, item.id).subscribe(path => {
            this.pageViewService.enterCategory(
                buildCategoryPath(path, categoriesConfig.nameField),
                item.id,
                sharedRootId
            );
            this.clearAndRefresh();
        });
    }

    openEdit(row: PageItem): void {
        const config = this._config();

        if (config) {
            this.pageActionsService.openEditForm(this.buildActionsContext(config), row);
        }
    }

    openForm<TValue>(config: ModalFormConfig<TValue>, submit: (value: TValue) => Observable<unknown>): void {
        this.pageActionsService.openRequestForm(config, submit, () => this.refresh());
    }

    refresh(): void {
        this.pageListService.refresh();
    }

    selectTab(key: string): void {
        const view = this._config()?.views.find(current => current.key === key);

        this.pageViewService.selectView(view ?? null, view ? PageViewMode.Table : (key as PageViewMode));
        this.clearAndRefresh();
    }

    setConfig<TValue, TItem extends PageItem, TCategory extends PageItem, TCategoryValue>(
        typedConfig: PageConfig<TValue, TItem, TCategory, TCategoryValue>
    ): void {
        const config = typedConfig as unknown as PageConfig;
        const isFirstConfig = this._config() === null;

        this._config.set(config);

        if (config.tableConfig?.order) {
            this.pageListService.setOrder(config.tableConfig.order);
        }

        if (isFirstConfig) {
            this.restoreState(this.pageStateService.restore(this.statePath, config.prefix));
            this.pageLinkService.follow(config);
        }

        this.pageOrganizationsService.loadForPage(config, this.pageListService.search().filters);
        config.onReady?.(this.handle);
    }

    setFilters(filters: SearchFilter[]): void {
        this.pageListService.setFilters(filters);
    }

    setSelected(items: PageItem[]): void {
        this.pageSelectionService.select(items);
        this._config()?.tableConfig?.onSelectionChange?.(items);
    }

    setSort(sort: TableSort | null): void {
        this.pageListService.setSort(sort, this._config()?.tableConfig?.order);
    }

    setViewMode(mode: PageViewMode): void {
        this.pageViewService.setViewMode(mode);
        this.clearAndRefresh();
    }

    private buildActionsContext(config: PageConfig): PageActionsContext {
        const clearAndRefresh = (): void => this.clearAndRefresh();
        const keepModal = (reference: BsModalRef<ModalFormDialogComponent>): void => {
            this.formModalReference = reference;
        };

        return {
            config,
            getCurrentCategory: () => this.pageViewService.currentCategory(),
            getCurrentCategoryId: () => this.pageViewService.currentCategoryId(),
            getSharedRoot: () => this.pageViewService.sharedRoot(),
            onCategoryDeleted: clearAndRefresh,
            onCategoryFormModalOpened: keepModal,
            onCategorySaved: () => this.refresh(),
            onDeleted: clearAndRefresh,
            onFormModalOpened: keepModal,
            onMoved: clearAndRefresh,
            onSaved: () => this.refresh(),
            onTrashItemDeleted: clearAndRefresh,
            selectedItems: () => this.pageSelectionService.selected()
        };
    }

    private clearAndRefresh(): void {
        this.pageSelectionService.clear();
        this.refresh();
    }

    private dropHiddenSort({ tableConfig }: PageConfig, columnContext: PageColumnContext): void {
        const choices = this.tableColumnsStorageService.load(tableConfig?.storageKey);

        if (tableConfig && !isPageSortShown(this.pageListService.sort(), tableConfig, columnContext, choices)) {
            this.setSort(null);
        }
    }

    private load(config: PageConfig, search: PageSearch): Observable<PageBackendResponse> {
        return this.pageListService.load(config, search).pipe(
            tap(response => {
                this.setSelected(this.pageSelectionService.keepListed(response.results));
                config.onDataLoaded?.(response);
                this.dropHiddenSort(config, this.pageListService.columnContext());
            }),
            catchError(() => EMPTY)
        );
    }

    private restoreState(state: PageState | undefined): void {
        const config = this._config();

        if (!config || !state) {
            return;
        }

        this.pageViewService.restore(state, config.views);
        this.pageListService.restore(state.search, state.sort);
        this.pageOwnersService.loadWhenFiltered(config, state.search.filters);
        this.pageSelectionService.select(state.selected);
    }

    private saveState(): void {
        const config = this._config();

        if (config) {
            this.pageStateService.leave(this.statePath, config.prefix, {
                ...this.pageViewService.toState(),
                search: this.pageListService.search(),
                selected: this.pageSelectionService.selected(),
                sort: this.pageListService.sort()
            });
        }
    }
}
