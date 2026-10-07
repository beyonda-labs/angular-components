import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, EMPTY, finalize, Observable, Subject, switchMap, tap } from 'rxjs';

import { toKeySegment } from '../../../utilities/key-segment';
import { BreadcrumbConfig, BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { HeaderConfig } from '../../header/models/header.model';
import { PAGINATION_SIZE_DEFAULT, PaginationConfig } from '../../pagination/models/pagination.model';
import { SearchConfig } from '../../search/models/search.model';
import { SearchFilter } from '../../search/models/search-filter.model';
import { TableColumn, TableConfig, TableSort, TableSortDirection } from '../../table/models/table.model';
import { LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { Tab, TabsConfig, TabsVariant } from '../../tabs/models/tabs.model';
import { isCategoryRow, readRowField } from '../functions/page-row';
import { findStandardMoveAction, isMoveDragAllowed, isMoveDropAllowed } from '../functions/page-row-drop';
import { PageBackendResponse, PageConfig, PageHandle } from '../models/page.model';
import { PageAction, PageActionZone } from '../models/page-action.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch, SearchSort, SearchSortDirection } from '../models/page-search.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageSearchService } from './page-search.service';

interface CategoryPathEntry {
    id: string | number;
    label: string;
}

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
    private readonly pageSearchService = inject(PageSearchService);

    private readonly config = signal<PageConfig | null>(null);
    private formModalReference?: BsModalRef<ModalFormDialogComponent>;
    private readonly globalActions = signal<string[] | null>(null);
    private readonly loads = new Subject<PageLoad>();
    private readonly tableSort = signal<TableSort | null>(null);

    readonly categoryBreadcrumbConfig = computed<BreadcrumbConfig | null>(() => {
        const config = this.config();

        if (!config?.tableConfig?.categoriesConfig) {
            return null;
        }

        if (this.viewMode() === PageViewMode.Trash) {
            return new BreadcrumbConfig({
                items: [
                    new BreadcrumbItem({ id: 0, label: `${config.prefix}.tabs.trash.label`, isTranslationKey: true })
                ],
                translate: false
            });
        }

        return new BreadcrumbConfig({
            items: [
                new BreadcrumbItem({ id: 0, label: `${config.prefix}.categories.root`, isTranslationKey: true }),
                ...this.categoryPath().map((entry, index) => new BreadcrumbItem({ id: index + 1, label: entry.label }))
            ],
            onItemClick: id => this.navigateBreadcrumb(id),
            translate: false
        });
    });
    readonly categoryPath = signal<CategoryPathEntry[]>([]);
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
            onPageChange: page => this.setPage(page),
            onPageSizeChange: pageSize => this.setPageSize(pageSize),
            page: search.page,
            pageSize: search.size,
            totalItems: this.totalItems()
        });
    });
    readonly searchConfig = computed<SearchConfig | null>(() => {
        const config = this.config();
        const search = config?.tableConfig?.search;

        if (!config || !search) {
            return null;
        }

        return new SearchConfig({
            fields: search.fields,
            mainField: search.mainField,
            onFiltersChange: filters => this.setFilters(filters),
            prefix: `${config.prefix}.search`
        });
    });
    readonly selected = signal<PageItem[]>([]);
    readonly tableConfig = computed<TableConfig<PageItem> | null>(() => {
        const config = this.config();
        const pageTable = config?.tableConfig;

        if (!config || !pageTable) {
            return null;
        }

        const tablePrefix = `${config.prefix}.table`;
        const { categoriesConfig } = pageTable;
        const moveAction = findStandardMoveAction(config.headerConfig?.actions ?? []);
        const canMoveByDrop = Boolean(config.baseUrl) && this.viewMode() === PageViewMode.Table;
        const dropMove = moveAction && categoriesConfig && canMoveByDrop ? { categoriesConfig, moveAction } : null;

        return new TableConfig<PageItem>({
            columns: pageTable.columns.map(
                column => new TableColumn({ ...column, tooltip: `${tablePrefix}.tooltips.${toKeySegment(column.key)}` })
            ),
            height: pageTable.height,
            isDropAllowed: dropMove
                ? (target, items) => isMoveDropAllowed(dropMove.moveAction, target, items, dropMove.categoriesConfig)
                : undefined,
            isRowDraggable: dropMove
                ? item => isMoveDragAllowed(dropMove.moveAction, item, dropMove.categoriesConfig)
                : undefined,
            isRowSelected: item => this.selected().some(selected => selected.id === item.id),
            items: this.items(),
            loadRow: item => this.loadRow(pageTable, item),
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

        if (!config?.tableConfig?.isTrashEnabled) {
            return null;
        }

        return new TabsConfig({
            activeTab: this.viewMode(),
            onTabChange: key => this.setViewMode(key as PageViewMode),
            prefix: config.prefix,
            tabs: [new Tab({ key: PageViewMode.Table }), new Tab({ key: PageViewMode.Trash })],
            variant: TabsVariant.Segmented
        });
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

        this.pageHttpService.loadCategoryPath(config.baseUrl, item.id).subscribe(path => {
            this.categoryPath.set(
                path.map(ancestor => ({
                    id: ancestor.id,
                    label: String(readRowField(ancestor, categoriesConfig.nameField) ?? '')
                }))
            );
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

    setConfig<TValue, TItem extends PageItem, TCategory extends PageItem, TCategoryValue>(
        typedConfig: PageConfig<TValue, TItem, TCategory, TCategoryValue>
    ): void {
        const config = typedConfig as unknown as PageConfig;

        this.config.set(config);

        if (config.tableConfig?.order) {
            const { order } = config.tableConfig;

            this.pageSearch.update(search => ({ ...search, sort: order }));
        }

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
            getCurrentCategoryId: () => this.currentCategoryId(),
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

    private load(config: PageConfig, search: PageSearch): Observable<PageBackendResponse> {
        const { baseUrl } = config;

        if (!baseUrl) {
            return EMPTY;
        }

        const categoriesConfig = config.tableConfig?.categoriesConfig;
        const viewingTrash = this.viewMode() === PageViewMode.Trash;
        const queryParameters = this.pageSearchService.buildQueryParameters(
            search,
            Boolean(config.tableConfig?.search) ||
                Boolean(config.tableConfig?.columns.some(column => column.isSortable))
        );

        if (categoriesConfig && !viewingTrash) {
            queryParameters[categoriesConfig.parentField] = this.currentCategoryId() ?? 'null';
        }

        this.loading.set(true);

        const request = viewingTrash
            ? this.pageHttpService.loadTrash(baseUrl, queryParameters)
            : this.pageHttpService.load(baseUrl, queryParameters);

        return request.pipe(
            tap(response => {
                this.items.set(response.results);
                this.totalItems.set(response.search?.total ?? response.results.length);
                this.globalActions.set(response.globalActions ?? []);
                this.restoreSelection();
                config.onDataLoaded?.(response);
            }),
            catchError(() => EMPTY),
            finalize(() => this.loading.set(false))
        );
    }

    private loadCategoryRow(
        category: PageItem,
        categoriesConfig: PageCategoriesConfig,
        viewMode: PageViewMode
    ): TableCell[] {
        if (categoriesConfig.loadRow) {
            return categoriesConfig.loadRow(category, viewMode);
        }

        const name = String(readRowField(category, categoriesConfig.nameField) ?? '');

        return [
            viewMode === PageViewMode.Trash
                ? new TextTableCell({ content: name })
                : new LinkTableCell({ action: () => this.openCategory(category), content: name })
        ];
    }

    private loadRow(tableConfig: PageTableConfig, item: PageItem): TableCell[] {
        const { categoriesConfig } = tableConfig;
        const viewMode = this.viewMode();

        return categoriesConfig && isCategoryRow(item, categoriesConfig)
            ? this.loadCategoryRow(item, categoriesConfig, viewMode)
            : tableConfig.loadRow(item, viewMode);
    }

    private restoreSelection(): void {
        const ids = new Set(this.selected().map(item => item.id));

        this.setSelected(this.items().filter(item => ids.has(item.id)));
    }

    private setPage(page: number): void {
        this.pageSearch.update(search => ({ ...search, page }));
    }

    private setPageSize(size: number): void {
        this.pageSearch.update(search => ({ ...search, page: 1, size }));
    }
}

function toSearchSort({ direction, field }: TableSort): SearchSort {
    return {
        direction: direction === TableSortDirection.Desc ? SearchSortDirection.Desc : SearchSortDirection.Asc,
        field
    };
}
