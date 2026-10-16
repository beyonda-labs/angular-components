import { TableConfigParameters } from '../../table/models/table.model';
import { PageConfig } from '../models/page.model';
import { PageAction, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { isSameOwner } from './page-move-owner';
import { isActionVisible, isCategoryRow, readRowField } from './page-row';

export function buildRowDropOptions(
    config: PageConfig,
    actions: PageAction[],
    viewMode: PageViewMode,
    onRowDrop: (target: PageItem, items: PageItem[]) => void
): Pick<TableConfigParameters<PageItem>, 'isDropAllowed' | 'isRowDraggable' | 'onRowDrop'> {
    const categoriesConfig = config.tableConfig?.categoriesConfig;
    const moveAction = findStandardMoveAction(actions);

    if (!moveAction || !categoriesConfig || !config.baseUrl || viewMode === PageViewMode.Trash) {
        return {};
    }

    return {
        isDropAllowed: (target, items) => isMoveDropAllowed(moveAction, target, items, categoriesConfig),
        isRowDraggable: item => isMoveDragAllowed(moveAction, item, categoriesConfig),
        onRowDrop
    };
}

export function findStandardMoveAction(actions: PageAction[]): PageAction | undefined {
    for (const action of actions) {
        const found =
            action.key === PageStandardAction.Move && !action.action
                ? action
                : findStandardMoveAction(action.subActions ?? []);

        if (found) {
            return found;
        }
    }

    return undefined;
}

export function isMoveDragAllowed(
    moveAction: PageAction,
    item: PageItem,
    categoriesConfig: PageCategoriesConfig
): boolean {
    return isActionVisible(moveAction, null, [item], categoriesConfig);
}

export function isMoveDropAllowed(
    moveAction: PageAction,
    target: PageItem,
    items: PageItem[],
    categoriesConfig: PageCategoriesConfig
): boolean {
    if (!isCategoryRow(target, categoriesConfig) || items.length === 0) {
        return false;
    }

    const draggedCategoryIds = new Set(
        items.filter(item => isCategoryRow(item, categoriesConfig)).map(item => item.id)
    );
    const targetParentId = readRowField(target, categoriesConfig.parentField) as string | number;
    const isAlreadyThere = items.every(item => readRowField(item, categoriesConfig.parentField) === target.id);

    if (draggedCategoryIds.has(target.id) || draggedCategoryIds.has(targetParentId) || !isSameOwner(target, items)) {
        return false;
    }

    return !isAlreadyThere && isActionVisible(moveAction, null, items, categoriesConfig);
}
