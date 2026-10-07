import { SearchFilter } from '../../search/models/search-filter.model';

export class PageView {
    filters: SearchFilter[];
    key: string;

    label?: string;

    constructor({ filters, key, label }: PageViewParameters) {
        this.filters = filters;
        this.key = key;
        this.label = label;
    }
}

export interface PageViewParameters {
    filters: SearchFilter[];
    key: string;

    label?: string;
}
