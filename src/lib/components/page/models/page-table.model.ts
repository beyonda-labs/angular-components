import { SearchField } from '../../search/models/search.model';
import { TableColumn } from '../../table/models/table.model';
import { TableCell } from '../../table/models/table-cell.model';
import { PageCategoriesConfig, PageViewMode } from './page-categories.model';
import { PageItem } from './page-item.model';
import { SearchSort } from './page-search.model';
import { PageCategoryPathEntry } from './page-state.model';

export interface PageColumnContext {
    isSearching: boolean;

    category?: PageCategoryPathEntry;
}

export class PageTableConfig<
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    canSelect: boolean;
    columns: TableColumn[];
    isPaginationShown: boolean;
    isSharedEnabled: boolean;
    isTrashEnabled: boolean;
    loadRow: (item: TItem, viewMode: PageViewMode) => TableCell[];

    categoriesConfig?: PageCategoriesConfig<TCategory, TCategoryValue>;
    height?: string;
    isColumnShown?: (column: TableColumn, context: PageColumnContext) => boolean;
    onSelectionChange?: (items: (TItem | TCategory)[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;
    storageKey?: string;

    constructor({
        canSelect = true,
        categoriesConfig,
        columns,
        height,
        isColumnShown,
        isPaginationShown = true,
        isSharedEnabled = false,
        isTrashEnabled = false,
        loadRow,
        onSelectionChange,
        order,
        search,
        storageKey
    }: PageTableConfigParameters<TItem, TCategory, TCategoryValue>) {
        this.canSelect = canSelect;
        this.categoriesConfig = categoriesConfig;
        this.columns = columns;
        this.height = height;
        this.isColumnShown = isColumnShown;
        this.isPaginationShown = isPaginationShown;
        this.isSharedEnabled = isSharedEnabled;
        this.isTrashEnabled = isTrashEnabled;
        this.loadRow = loadRow;
        this.onSelectionChange = onSelectionChange;
        this.order = order;
        this.search = search;
        this.storageKey = storageKey;
    }
}

export class PageTableSearchConfig {
    fields: SearchField[];
    isOrganizationFilterEnabled: boolean;
    isOwnerFilterEnabled: boolean;

    mainField?: string;
    textField?: string;

    constructor({
        fields,
        isOrganizationFilterEnabled = false,
        isOwnerFilterEnabled = false,
        mainField,
        textField
    }: PageTableSearchConfigParameters) {
        this.fields = fields;
        this.isOrganizationFilterEnabled = isOrganizationFilterEnabled;
        this.isOwnerFilterEnabled = isOwnerFilterEnabled;
        this.mainField = mainField;
        this.textField = textField;
    }
}

export interface PageTableConfigParameters<
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    columns: TableColumn[];
    loadRow: (item: TItem, viewMode: PageViewMode) => TableCell[];

    canSelect?: boolean;
    categoriesConfig?: PageCategoriesConfig<TCategory, TCategoryValue>;
    height?: string;
    isColumnShown?: (column: TableColumn, context: PageColumnContext) => boolean;
    isPaginationShown?: boolean;
    isSharedEnabled?: boolean;
    isTrashEnabled?: boolean;
    onSelectionChange?: (items: (TItem | TCategory)[]) => void;
    order?: SearchSort;
    search?: PageTableSearchConfig;
    storageKey?: string;
}

export interface PageTableSearchConfigParameters {
    fields: SearchField[];

    isOrganizationFilterEnabled?: boolean;
    isOwnerFilterEnabled?: boolean;
    mainField?: string;
    textField?: string;
}
