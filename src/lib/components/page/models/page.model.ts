import { PageViewMode } from './page-categories.model';
import { PageFormConfig } from './page-form.model';
import { PageHeaderConfig } from './page-header.model';
import { PageItem } from './page-item.model';
import { PageSearch } from './page-search.model';
import { PageTableConfig } from './page-table.model';

export interface PageBackendResponse<TRow extends PageItem = PageItem> {
    globalActions: string[];
    results: TRow[];

    search?: PageSearch;
}

export interface PageHandle<TItem extends PageItem = PageItem, TCategory extends PageItem = TItem> {
    openCategory(category: TCategory): void;
    refresh(): void;
    selected(): (TItem | TCategory)[];
    viewMode(): PageViewMode;
}

export class PageConfig<
    TValue = unknown,
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    prefix: string;

    baseUrl?: string;
    formConfig?: PageFormConfig<TValue, TItem>;
    headerConfig?: PageHeaderConfig<TItem>;
    onDataLoaded?: (response: PageBackendResponse<TItem | TCategory>) => void;
    onReady?: (handle: PageHandle<TItem, TCategory>) => void;
    tableConfig?: PageTableConfig<TItem, TCategory, TCategoryValue>;

    constructor({
        baseUrl,
        formConfig,
        headerConfig,
        onDataLoaded,
        onReady,
        prefix,
        tableConfig
    }: PageConfigParameters<TValue, TItem, TCategory, TCategoryValue>) {
        this.baseUrl = baseUrl;
        this.formConfig = formConfig;
        this.headerConfig = headerConfig;
        this.onDataLoaded = onDataLoaded;
        this.onReady = onReady;
        this.prefix = prefix;
        this.tableConfig = tableConfig;
    }
}

export interface PageConfigParameters<
    TValue = unknown,
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    prefix: string;

    baseUrl?: string;
    formConfig?: PageFormConfig<TValue, TItem>;
    headerConfig?: PageHeaderConfig<TItem>;
    onDataLoaded?: (response: PageBackendResponse<TItem | TCategory>) => void;
    onReady?: (handle: PageHandle<TItem, TCategory>) => void;
    tableConfig?: PageTableConfig<TItem, TCategory, TCategoryValue>;
}
