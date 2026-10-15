import { PageAction, PageActionScope, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageTrashItem } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { hasOneOwner } from './page-move-owner';

const CATEGORY_HANDLER_KEYS = new Set<string>([PageStandardAction.Share]);
const EVERY_ROW_HANDLER_KEYS = new Set<string>([PageStandardAction.Transfer]);
const ROWLESS_SCOPES = new Set([PageActionScope.Global, PageActionScope.Group]);
const SINGLE_ROW_KEYS = new Set<string>([
    PageStandardAction.Edit,
    PageStandardAction.EditCategory,
    PageStandardAction.View
]);

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

    if (action.action && toHandlerItems(action, selectedItems, categoriesConfig).length === 0) {
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

export function keepListedRows(selected: PageItem[], items: PageItem[]): PageItem[] {
    const ids = new Set(selected.map(item => item.id));

    return items.filter(item => ids.has(item.id));
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

    if (EVERY_ROW_HANDLER_KEYS.has(action.key)) {
        return selectedItems;
    }

    const takesCategories = CATEGORY_HANDLER_KEYS.has(action.key);

    return selectedItems.filter(item => isCategoryRow(item, categoriesConfig) === takesCategories);
}

export function toTrashItems(items: PageItem[], categoriesConfig?: PageCategoriesConfig): PageTrashItem[] {
    return items.map(item => ({
        id: item.id,
        type: isCategoryRow(item, categoriesConfig) ? PageItemType.Category : PageItemType.Item
    }));
}
