import { PageAction, PageActionScope, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageTrashItem } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { hasOneOwner } from './page-move-owner';

const ROWLESS_SCOPES = new Set([PageActionScope.Global, PageActionScope.Group]);
const SINGLE_ROW_KEYS = new Set<string>([PageStandardAction.Edit, PageStandardAction.EditCategory]);

export function isActionVisible(
    action: PageAction,
    allowedKeys: string[] | null,
    selectedItems: PageItem[],
    categoriesConfig?: PageCategoriesConfig
): boolean {
    if (action.scope === PageActionScope.Global) {
        return allowedKeys?.includes(action.key) ?? false;
    }

    const needsOneRow = action.scope === PageActionScope.Single || SINGLE_ROW_KEYS.has(action.key);

    if (selectedItems.length === 0 || (needsOneRow && selectedItems.length !== 1)) {
        return false;
    }

    if (action.handler && toHandlerItems(action, selectedItems, categoriesConfig).length === 0) {
        return false;
    }

    if (action.key === PageStandardAction.Move && !hasOneOwner(selectedItems)) {
        return false;
    }

    return selectedItems.every(item => item.actions?.includes(action.key));
}

export function isCategoryRow(item: PageItem, categoriesConfig?: PageCategoriesConfig): boolean {
    return categoriesConfig !== undefined && readRowField(item, categoriesConfig.typeField) === PageItemType.Category;
}

export function readRowField(item: PageItem, field: string): unknown {
    return (item as unknown as Record<string, unknown>)[field];
}

export function toHandlerItems(
    action: PageAction,
    selectedItems: PageItem[],
    categoriesConfig?: PageCategoriesConfig
): PageItem[] {
    if (ROWLESS_SCOPES.has(action.scope)) {
        return [];
    }

    return selectedItems.filter(item => !isCategoryRow(item, categoriesConfig));
}

export function toTrashItems(items: PageItem[]): PageTrashItem[] {
    return items.map(item => {
        const { id, type } = item as PageTrashItem;

        return { id, type };
    });
}
