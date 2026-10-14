import { SearchFilter } from '../../search/models/search-filter.model';

export class PageView {
    filters: SearchFilter[];
    key: string;

    baseUrl?: string;
    label?: string;

    constructor({ baseUrl, filters, key, label }: PageViewParameters) {
        this.baseUrl = baseUrl;
        this.filters = filters;
        this.key = key;
        this.label = label;
    }
}

export interface PageViewParameters {
    filters: SearchFilter[];
    key: string;

    baseUrl?: string;
    label?: string;
}
