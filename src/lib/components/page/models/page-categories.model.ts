import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { SHARED_FOLDER_ICON } from '../../../utilities/icons.model';
import { TableCell } from '../../table/models/table-cell.model';
import { PageFormConfig } from './page-form.model';
import { PageItem } from './page-item.model';

export enum PageItemType {
    Category = 'category',
    Item = 'item'
}

export enum PageViewMode {
    Shared = 'shared',
    Table = 'table',
    Trash = 'trash'
}

export interface PageCategoryIcon {
    icon: IconDefinition;
    label: string;
}

export interface PageCountLabels {
    one: string;
    other: string;
}

export interface PageFolderCount {
    total: number;

    categoryTotal?: number;
}

export interface PageMoveTarget {
    id: string | number | null;
}

export interface PageRestoredRename {
    field: string;
    from: string;
    id: string | number;
    to: string;
    type: PageItemType;
}

export interface PageTrashItem {
    id: string | number;
    type: PageItemType;
}

export const PAGE_CATEGORY_COUNT_LABELS: PageCountLabels = {
    one: 'angular-components.page.count.categories.one',
    other: 'angular-components.page.count.categories.other'
};
export const PAGE_ITEM_COUNT_LABELS: PageCountLabels = {
    one: 'angular-components.page.count.items.one',
    other: 'angular-components.page.count.items.other'
};
export const PAGE_SHARED_CATEGORY_ICON: PageCategoryIcon = {
    icon: SHARED_FOLDER_ICON,
    label: 'angular-components.page.shared.folder'
};

export class PageCategoriesConfig<TCategory extends PageItem = PageItem, TCategoryValue = unknown> {
    countLabels: PageCountLabels;
    itemCountLabels: PageCountLabels;
    nameField: string;
    parentField: string;
    parentPathField: string;
    sharedIcon: PageCategoryIcon;
    typeField: string;

    formConfig?: PageFormConfig<TCategoryValue, TCategory>;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];

    constructor({
        countLabels = PAGE_CATEGORY_COUNT_LABELS,
        formConfig,
        itemCountLabels = PAGE_ITEM_COUNT_LABELS,
        loadRow,
        nameField = 'name',
        parentField = 'parentId',
        parentPathField = 'parentPath',
        sharedIcon = PAGE_SHARED_CATEGORY_ICON,
        typeField = 'type'
    }: PageCategoriesConfigParameters<TCategory, TCategoryValue> = {}) {
        this.countLabels = countLabels;
        this.formConfig = formConfig;
        this.itemCountLabels = itemCountLabels;
        this.loadRow = loadRow;
        this.nameField = nameField;
        this.parentField = parentField;
        this.parentPathField = parentPathField;
        this.sharedIcon = sharedIcon;
        this.typeField = typeField;
    }
}

export interface PageCategoriesConfigParameters<TCategory extends PageItem = PageItem, TCategoryValue = unknown> {
    countLabels?: PageCountLabels;
    formConfig?: PageFormConfig<TCategoryValue, TCategory>;
    itemCountLabels?: PageCountLabels;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];
    nameField?: string;
    parentField?: string;
    parentPathField?: string;
    sharedIcon?: PageCategoryIcon;
    typeField?: string;
}
