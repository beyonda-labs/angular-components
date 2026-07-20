import { PageSearch } from './page-search.model';

export interface PageStateSnapshot {
    search: PageSearch;
    selectedIds: (string | number)[];
}
