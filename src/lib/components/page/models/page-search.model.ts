import { SearchFilter } from '../../search/models/search-filter.model';
import { PageOwner } from './page-owner.model';

export enum SearchSortDirection {
    Asc = 'asc',
    Desc = 'desc'
}

export interface PageSearch {
    filters: SearchFilter[];
    page: number;
    size: number;

    sort?: SearchSort;
    text?: string;
    total?: number;
}

export interface PageSearchConfigOptions {
    filters: SearchFilter[];
    onFiltersChange: (filters: SearchFilter[]) => void;
    onPanelOpen: () => void;
    owners: PageOwner[];
}

export interface SearchSort {
    direction: SearchSortDirection;
    field: string;
}
