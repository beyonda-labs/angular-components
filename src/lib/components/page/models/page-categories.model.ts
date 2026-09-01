import { EventEmitter } from '@angular/core';

import { PageFormConfig } from './page-form.model';
import { PageItem } from './page-item.model';

export class PageCategoriesConfig {
    readonly nameField: string;
    readonly parentField: string;
    readonly typeField: string;
    readonly useTrash: boolean;

    $openCategory: EventEmitter<PageItem>;
    formConfig?: PageFormConfig;

    constructor({
        formConfig,
        nameField = 'name',
        parentField = 'parentId',
        typeField = 'type',
        useTrash = false
    }: PageCategoriesConfigParameters) {
        this.$openCategory = new EventEmitter<PageItem>();
        this.formConfig = formConfig;
        this.nameField = nameField;
        this.parentField = parentField;
        this.typeField = typeField;
        this.useTrash = useTrash;
    }

    openCategory(item: PageItem): void {
        this.$openCategory.emit(item);
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
