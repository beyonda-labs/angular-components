import { PageViewMode } from './page-categories.model';
import { PageFormConfig } from './page-form.model';
import { PageHeaderConfig } from './page-header.model';
import { PageItem } from './page-item.model';
import { PageSearch } from './page-search.model';
import { PageTableConfig } from './page-table.model';

export interface PageBackendResponse {
    globalActions: string[];
    results: PageItem[];

    search?: PageSearch;
}

export interface PageHandle {
    openCategory(item: PageItem): void;
    refresh(): void;
    selected(): PageItem[];
    viewMode(): PageViewMode;
}

export class PageConfig {
    prefix: string;

    baseUrl?: string;
    formConfig?: PageFormConfig;
    headerConfig?: PageHeaderConfig;
    onDataLoaded?: (response: PageBackendResponse) => void;
    onReady?: (handle: PageHandle) => void;
    tableConfig?: PageTableConfig;

    constructor({
        prefix,
        baseUrl,
        formConfig,
        headerConfig,
        onDataLoaded,
        onReady,
        tableConfig
    }: PageConfigParameters) {
        this.baseUrl = baseUrl;
        this.formConfig = formConfig;
        this.headerConfig = headerConfig;
        this.onDataLoaded = onDataLoaded;
        this.onReady = onReady;
        this.prefix = prefix;
        this.tableConfig = tableConfig;
    }
}

export interface PageConfigParameters {
    prefix: string;

    baseUrl?: string;
    formConfig?: PageFormConfig;
    headerConfig?: PageHeaderConfig;
    onDataLoaded?: (response: PageBackendResponse) => void;
    onReady?: (handle: PageHandle) => void;
    tableConfig?: PageTableConfig;
}
