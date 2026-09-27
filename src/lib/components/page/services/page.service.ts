import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { toKeySegment } from '../../../internal/i18n/key-segment';
import { BreadcrumbConfig, BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { HeaderConfig } from '../../header/models/header.model';
import { PAGINATION_SIZE_DEFAULT, PaginationConfig } from '../../pagination/models/pagination.model';
import { SearchConfig } from '../../search/models/search.model';
import { SearchFilter } from '../../search/models/search-filter.model';
import { TableColumn, TableConfig } from '../../table/models/table.model';
import { Tab, TabsConfig, TabsVariant } from '../../tabs/models/tabs.model';
import { PageConfig, PageHandle } from '../models/page.model';
import { PageAction, PageActionZone } from '../models/page-action.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch } from '../models/page-search.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageSearchService } from './page-search.service';

interface CategoryPathEntry {
    id: string | number;
    label: string;
}

const INITIAL_SEARCH: PageSearch = { filters: [], page: 1, size: PAGINATION_SIZE_DEFAULT };

@Injectable()
export class PageService {
    readonly categoryPath = signal<CategoryPathEntry[]>([]);
    readonly viewMode = signal<PageViewMode>(PageViewMode.Table);

    private readonly config = signal<PageConfig | null>(null);
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
    readonly currentCategoryId = signal<string | number | null>(null);
    readonly handle: PageHandle = {
        openCategory: item => this.openCategory(item),
        refresh: () => this.refresh(),
        selected: () => this.selected(),
        viewMode: () => this.viewMode()
    };
    readonly selected = signal<PageItem[]>([]);

    private readonly globalActions = signal<string[] | null>(null);

    private readonly pageActionsService = inject(PageActionsService);
    readonly visibleActions = computed<PageAction[]>(() =>
        this.pageActionsService.filterVisibleActions(
            this.config()?.headerConfig?.actions ?? [],
            this.globalActions(),
            this.selected()
        )
    );
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
    readonly totalItems = signal(0);
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
    readonly tableConfig = computed<TableConfig<PageItem> | null>(() => {
        const config = this.config();
        const pageTable = config?.tableConfig;

        if (!config || !pageTable) {
            return null;
        }

        const tablePrefix = `${config.prefix}.table`;

        return new TableConfig<PageItem>({
            columns: pageTable.columns.map(
                column =>
                    new TableColumn({
                        key: column.key,
                        tooltip: `${tablePrefix}.tooltips.${toKeySegment(column.key)}`,
                        width: column.width
                    })
            ),
            height: pageTable.height,
            isRowSelected: item => this.selected().some(selected => selected.id === item.id),
            items: this.items(),
            loadRow: item => pageTable.loadRow(item, this.viewMode()),
            prefix: tablePrefix,
            selectable: pageTable.allowSelection,
            selectedItemsChange: items => this.setSelected(items)
        });
    });
    readonly viewToggleConfig = computed<TabsConfig | null>(() => {
        const config = this.config();

        if (!config?.tableConfig?.categoriesConfig?.useTrash) {
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

    private formModalReference?: BsModalRef<ModalFormDialogComponent>;

    private readonly destroyRef = inject(DestroyRef);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageSearchService = inject(PageSearchService);

    constructor() {
        effect(() => {
            const config = this.config();
            const search = this.pageSearch();

            if (config) {
                untracked(() => this.load(config, search));
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
                    label: (ancestor as unknown as Record<string, unknown>)[categoriesConfig.nameField] as string
                }))
            );
            this.currentCategoryId.set(item.id);
            this.selected.set([]);
            this.refresh();
        });
    }

    refresh(): void {
        this.pageSearch.update(search => ({ ...search, page: 1 }));
    }

    setConfig<TValue>(typedConfig: PageConfig<TValue>): void {
        const config = typedConfig as PageConfig;

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

    private load(config: PageConfig, search: PageSearch): void {
        const { baseUrl } = config;

        if (!baseUrl) {
            return;
        }

        const categoriesConfig = config.tableConfig?.categoriesConfig;
        const viewingTrash = this.viewMode() === PageViewMode.Trash;
        const queryParameters = this.pageSearchService.buildQueryParameters(
            search,
            Boolean(config.tableConfig?.search)
        );

        if (categoriesConfig && !viewingTrash) {
            queryParameters[categoriesConfig.parentField] = this.currentCategoryId() ?? 'null';
        }

        this.loading.set(true);

        const request = viewingTrash
            ? this.pageHttpService.loadTrash(baseUrl, queryParameters)
            : this.pageHttpService.load(baseUrl, queryParameters);

        request.subscribe({
            complete: () => this.loading.set(false),
            error: () => this.loading.set(false),
            next: response => {
                this.items.set(response.results);
                this.totalItems.set(response.search?.total ?? response.results.length);
                this.globalActions.set(response.globalActions ?? []);
                this.restoreSelection();
                config.onDataLoaded?.(response);
            }
        });
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
