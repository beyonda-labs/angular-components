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

export interface PageTrashItem {
    id: string | number;
    type: PageItemType;
}

export class PageCategoriesConfig<TCategory extends PageItem = PageItem> {
    nameField: string;
    parentField: string;
    typeField: string;
    useTrash: boolean;

    formConfig?: PageFormConfig<unknown, TCategory>;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];

    constructor({
        formConfig,
        loadRow,
        nameField = 'name',
        parentField = 'parentId',
        typeField = 'type',
        useTrash = false
    }: PageCategoriesConfigParameters<TCategory>) {
        this.formConfig = formConfig;
        this.loadRow = loadRow;
        this.nameField = nameField;
        this.parentField = parentField;
        this.typeField = typeField;
        this.useTrash = useTrash;
    }
}

export interface PageCategoriesConfigParameters<TCategory extends PageItem = PageItem> {
    formConfig?: PageFormConfig<unknown, TCategory>;
    loadRow?: (category: TCategory, viewMode: PageViewMode) => TableCell[];
    nameField?: string;
    parentField?: string;
    typeField?: string;
    useTrash?: boolean;
}
