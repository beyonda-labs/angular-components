import { computed, effect, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { HeaderConfig } from '../../header/models/header.model';
import { PAGINATION_SIZE_DEFAULT, PaginationConfig } from '../../pagination/models/pagination.model';
import { SearchConfig } from '../../search/models/search.model';
import { SearchFilter } from '../../search/models/search-filter.model';
import { TableColumn, TableConfig } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionZone } from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';
import { PageSearch } from '../models/page-search.model';
import { PageActionsContext, PageActionsService } from './page-actions.service';
import { PageHttpService } from './page-http.service';
import { PageSearchService } from './page-search.service';
import { PageStateRegistry } from './page-state-registry.service';

@Injectable()
export class PageService implements OnDestroy {
    readonly items = signal<PageItem[]>([]);
    readonly loading = signal(false);
    readonly pageSearch = signal<PageSearch>({ filters: [], page: 1, size: PAGINATION_SIZE_DEFAULT });
    readonly selected = signal<PageItem[]>([]);
    readonly totalItems = signal(0);

    private readonly globalActions = signal<string[] | null>(null);
    private readonly initialized = signal(false);

    private readonly pageActionsService = inject(PageActionsService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageSearchService = inject(PageSearchService);
    private readonly stateRegistry = inject(PageStateRegistry);

    private config?: PageConfig;
    private formModalReference?: BsModalRef<ModalFormDialogComponent>;
    private pendingSelectedIds: (string | number)[] | null = null;
    private refreshSubscription?: Subscription;

    private readonly executeActionHandler = (action: PageAction): void =>
        this.pageActionsService.executeAction(action, this.buildActionsContext());

    // eslint-disable-next-line unicorn/consistent-function-scoping
    readonly visibleActions = computed<PageAction[]>(() => {
        if (!this.initialized()) {
            return [];
        }

        return this.pageActionsService.filterVisibleActions(
            this.config?.headerConfig?.actions ?? [],
            this.globalActions(),
            this.selected()
        );
    });

    readonly headerConfig = computed<HeaderConfig | null>(() => {
        if (!this.initialized() || !this.config?.headerConfig) {
            return null;
        }

        const visible = this.visibleActions();
        const execute = this.executeActionHandler;

        return new HeaderConfig({
            leftActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Left, execute),
            menuActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Menu, execute),
            prefix: this.config.prefix,
            rightActions: this.pageActionsService.buildHeaderActions(visible, PageActionZone.Right, execute),
            title: this.config.headerConfig.title
        });
    });

    readonly searchConfig = computed<SearchConfig | null>(() => {
        const search = this.config?.tableConfig?.search;

        if (!this.initialized() || !search) {
            return null;
        }

        return new SearchConfig({
            fields: search.fields,
            mainField: search.mainField,
            onFiltersChange: filters => this.setFilters(filters),
            prefix: `${this.config!.prefix}.search`
        });
    });

    readonly tableConfig = computed<TableConfig | null>(() => {
        const pageTable = this.config?.tableConfig;

        if (!this.initialized() || !pageTable) {
            return null;
        }

        const tablePrefix = `${this.config!.prefix}.table`;

        return new TableConfig({
            columns: pageTable.columns.map(
                column =>
                    new TableColumn({
                        key: column.key,
                        tooltip: `${tablePrefix}.tooltips.${column.key}`,
                        width: column.width
                    })
            ),
            height: pageTable.height,
            isRowSelected: item => this.selected().some(selected => selected.id === (item as unknown as PageItem).id),
            items: this.items() as unknown as Record<string, unknown>[],
            loadRow: item => pageTable.loadRow(item as unknown as PageItem),
            prefix: tablePrefix,
            selectable: pageTable.allowSelection,
            selectedItemsChange: items => this.setSelected(items as unknown as PageItem[])
        });
    });

    readonly paginationConfig = computed<PaginationConfig | null>(() => {
        if (!this.initialized() || !this.config?.tableConfig || this.totalItems() === 0) {
            return null;
        }

        const search = this.pageSearch();

        return new PaginationConfig({
            onPageChange: config => this.setPage(config.page),
            onPageSizeChange: config => this.setPageSize(config.pageSize),
            page: search.page,
            pageSize: search.size,
            totalItems: this.totalItems()
        });
    });

    constructor() {
        effect(() => {
            if (!this.initialized()) {
                return;
            }

            this.pageSearch();

            untracked(() => this.load());
        });
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
        this.formModalReference?.hide();

        //TODO: fix
        /*if (this.config) {
            this.stateRegistry.save(this.config.page, {
                search: this.pageSearch(),
                selectedIds: this.selected().map(item => item.id)
            });
        }*/
    }

    init(config: PageConfig): void {
        this.config = config;

        const snapshot = this.stateRegistry.restore(config.page);

        if (snapshot) {
            this.pageSearch.set(snapshot.search);
            this.pendingSelectedIds = snapshot.selectedIds;
        } else if (config.tableConfig?.order) {
            this.pageSearch.update(search => ({ ...search, sort: config.tableConfig!.order }));
        }

        this.refreshSubscription = config.$refresh.subscribe(() => this.refresh());
        this.initialized.set(true);
    }

    load(): void {
        if (!this.config) {
            return;
        }

        if (this.config.baseUrl) {
            this.loadFromBackend();
        }
    }

    refresh(): void {
        this.pageSearch.update(search => ({ ...search, page: 1 }));
    }

    setFilters(filters: SearchFilter[]): void {
        this.pageSearch.update(search => ({ ...search, filters, page: 1 }));
    }

    setSelected(items: PageItem[]): void {
        this.selected.set(items);
        this.config?.tableConfig?.onSelectionChange?.(items);
    }

    private buildActionsContext(): PageActionsContext {
        return {
            config: this.config!,
            onDeleted: () => {
                this.selected.set([]);
                this.refresh();
            },
            onFormModalOpened: reference => (this.formModalReference = reference),
            onSaved: () => {
                if (this.config?.tableConfig) {
                    this.refresh();
                }
            },
            selectedItems: () => this.selected()
        };
    }

    private loadFromBackend(): void {
        this.loading.set(true);

        const queryParameters = this.pageSearchService.buildQueryParameters(
            this.pageSearch(),
            Boolean(this.config?.tableConfig?.search)
        );

        this.pageHttpService.load(this.config!.baseUrl!, queryParameters).subscribe({
            complete: () => this.loading.set(false),
            error: () => this.loading.set(false),
            next: response => {
                this.items.set(response.results);
                this.totalItems.set(response.search?.total ?? response.results.length);
                this.globalActions.set(response.globalActions ?? []);
                this.restoreSelection();
                this.config?.onDataLoaded?.(response);
            }
        });
    }

    private restoreSelection(): void {
        const ids = this.pendingSelectedIds ?? this.selected().map(item => item.id);

        this.pendingSelectedIds = null;

        const restored = this.items().filter(item => ids.includes(item.id));

        this.setSelected(restored);
    }

    private setPage(page: number): void {
        this.pageSearch.update(search => ({ ...search, page }));
    }

    private setPageSize(size: number): void {
        this.pageSearch.update(search => ({ ...search, page: 1, size }));
    }
}
