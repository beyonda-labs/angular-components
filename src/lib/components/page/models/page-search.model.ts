import { SearchFilter } from '../../search/models/search-filter.model';

export interface PageSearch {
    filters: SearchFilter[];
    page: number;
    size: number;

    sort?: SearchSort;
    text?: string;
    total?: number;
}

export enum SearchSortDirection {
    Asc = 'asc',
    Desc = 'desc'
}

export interface SearchSort {
    direction: SearchSortDirection;
    field: string;
}
