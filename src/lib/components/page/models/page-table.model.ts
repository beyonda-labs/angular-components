import { SearchField } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { PageCategoriesConfig, PageViewMode } from './page-categories.model';
import { PageItem } from './page-item.model';
import { SearchSort } from './page-search.model';

export class PageTableConfig<
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    allowSelection: boolean;
    columns: TableColumn[];
    height: string;
    isTrashEnabled: boolean;
    loadRow: (item: TItem, viewMode: PageViewMode) => TableCell[];
    showPagination: boolean;

    categoriesConfig?: PageCategoriesConfig<TCategory, TCategoryValue>;
    onSelectionChange?: (items: (TItem | TCategory)[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;

    constructor({
        allowSelection = true,
        categoriesConfig,
        columns,
        height = '60vh',
        isTrashEnabled = false,
        loadRow,
        onSelectionChange,
        order,
        search,
        showPagination = true
    }: PageTableConfigParameters<TItem, TCategory, TCategoryValue>) {
        this.allowSelection = allowSelection;
        this.categoriesConfig = categoriesConfig;
        this.columns = columns;
        this.height = height;
        this.isTrashEnabled = isTrashEnabled;
        this.loadRow = loadRow;
        this.onSelectionChange = onSelectionChange;
        this.order = order;
        this.search = search;
        this.showPagination = showPagination;
    }
}

export class PageTableSearchConfig {
    fields: SearchField[];

    mainField?: string;

    constructor({ fields, mainField }: PageTableSearchConfigParameters) {
        this.fields = fields;
        this.mainField = mainField;
    }
}

export interface PageTableConfigParameters<
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    columns: TableColumn[];
    loadRow: (item: TItem, viewMode: PageViewMode) => TableCell[];

    allowSelection?: boolean;
    categoriesConfig?: PageCategoriesConfig<TCategory, TCategoryValue>;
    height?: string;
    isTrashEnabled?: boolean;
    onSelectionChange?: (items: (TItem | TCategory)[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;
    showPagination?: boolean;
}

export interface PageTableSearchConfigParameters {
    fields: SearchField[];

    mainField?: string;
}
