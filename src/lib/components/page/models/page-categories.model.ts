import { PageFormConfig } from './page-form.model';

export class PageCategoriesConfig {
    nameField: string;
    parentField: string;
    typeField: string;
    useTrash: boolean;

    formConfig?: PageFormConfig;

    constructor({
        formConfig,
        nameField = 'name',
        parentField = 'parentId',
        typeField = 'type',
        useTrash = false
    }: PageCategoriesConfigParameters) {
        this.formConfig = formConfig;
        this.nameField = nameField;
        this.parentField = parentField;
        this.typeField = typeField;
        this.useTrash = useTrash;
    }
}

export interface PageCategoriesConfigParameters {
    formConfig?: PageFormConfig;
    nameField?: string;
    parentField?: string;
    typeField?: string;
    useTrash?: boolean;
}

export enum PageItemType {
    Category = 'category',
    Item = 'item'
}

export interface PageTrashItem {
    id: string | number;
    type: PageItemType;
}

export enum PageViewMode {
    Table = 'table',
    Trash = 'trash'
}
