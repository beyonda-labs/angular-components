import { EventEmitter } from '@angular/core';

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

export class PageConfig {
    $refresh: EventEmitter<void>;
    page: string;
    prefix: string;

    baseUrl?: string;
    formConfig?: PageFormConfig;
    headerConfig?: PageHeaderConfig;
    onDataLoaded?: (response: PageBackendResponse) => void;
    tableConfig?: PageTableConfig;

    constructor({
        page,
        prefix = page,

        baseUrl,
        formConfig,
        headerConfig,
        onDataLoaded,
        tableConfig
    }: PageConfigParameters) {
        this.$refresh = new EventEmitter<void>();
        this.baseUrl = baseUrl;
        this.formConfig = formConfig;
        this.headerConfig = headerConfig;
        this.onDataLoaded = onDataLoaded;
        this.page = page;
        this.prefix = prefix;
        this.tableConfig = tableConfig;
    }

    refresh(): void {
        this.$refresh.emit();
    }
}

export interface PageConfigParameters {
    page: string;

    baseUrl?: string;
    formConfig?: PageFormConfig;
    headerConfig?: PageHeaderConfig;
    onDataLoaded?: (response: PageBackendResponse) => void;
    prefix?: string;
    tableConfig?: PageTableConfig;
}
