import { SearchField } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { PageCategoriesConfig, PageViewMode } from './page-categories.model';
import { PageItem } from './page-item.model';
import { SearchSort } from './page-search.model';

export class PageTableConfig {
    allowSelection: boolean;
    columns: TableColumn[];
    height: string;
    loadRow: (item: PageItem, viewMode: PageViewMode) => TableCell[];
    showPagination: boolean;

    categoriesConfig?: PageCategoriesConfig;
    onSelectionChange?: (items: PageItem[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;

    constructor({
        allowSelection = true,
        categoriesConfig,
        columns,
        height = '60vh',
        loadRow,
        onSelectionChange,
        order,
        search,
        showPagination = true
    }: PageTableConfigParameters) {
        this.allowSelection = allowSelection;
        this.categoriesConfig = categoriesConfig;
        this.columns = columns;
        this.height = height;
        this.loadRow = loadRow;
        this.onSelectionChange = onSelectionChange;
        this.order = order;
        this.search = search;
        this.showPagination = showPagination;
    }
}

export interface PageTableConfigParameters {
    columns: TableColumn[];
    loadRow: (item: PageItem, viewMode: PageViewMode) => TableCell[];

    allowSelection?: boolean;
    categoriesConfig?: PageCategoriesConfig;
    height?: string;
    onSelectionChange?: (items: PageItem[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;
    showPagination?: boolean;
}

export class PageTableSearchConfig {
    fields: SearchField[];

    mainField?: string;

    constructor({ fields, mainField }: PageTableSearchConfigParameters) {
        this.fields = fields;
        this.mainField = mainField;
    }
}

export interface PageTableSearchConfigParameters {
    fields: SearchField[];

    mainField?: string;
}
