import { TableCell } from '../../table/models/table-cell.model';
import { PageFormConfig } from './page-form.model';
import { PageItem } from './page-item.model';

export enum PageItemType {
    Category = 'category',
    Item = 'item'
}

export enum PageViewMode {
    Table = 'table',
    Trash = 'trash'
}

export interface PageMoveTarget {
    id: string | number | null;
}

export interface PageTrashItem {
    id: string | number;
    type: PageItemType;
}

export class PageCategoriesConfig<TCategory extends PageItem = PageItem, TCategoryValue = unknown> {
    nameField: string;
    parentField: string;
    typeField: string;

    formConfig?: PageFormConfig<TCategoryValue, TCategory>;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];

    constructor({
        formConfig,
        loadRow,
        nameField = 'name',
        parentField = 'parentId',
        typeField = 'type'
    }: PageCategoriesConfigParameters<TCategory, TCategoryValue>) {
        this.formConfig = formConfig;
        this.loadRow = loadRow;
        this.nameField = nameField;
        this.parentField = parentField;
        this.typeField = typeField;
    }
}

export interface PageCategoriesConfigParameters<TCategory extends PageItem = PageItem, TCategoryValue = unknown> {
    formConfig?: PageFormConfig<TCategoryValue, TCategory>;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];
    nameField?: string;
    parentField?: string;
    typeField?: string;
}
