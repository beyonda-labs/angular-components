import { TableSort } from '../../table/models/table.model';
import { PageViewMode } from './page-categories.model';
import { PageItem } from './page-item.model';
import { PageSearch } from './page-search.model';

export interface PageCategoryPathEntry {
    id: string | number;
    label: string;
}

export interface PageState {
    categoryPath: PageCategoryPathEntry[];
    currentCategoryId: string | number | null;
    search: PageSearch;
    selected: PageItem[];
    sort: TableSort | null;
    view: string | null;
    viewMode: PageViewMode;
}
