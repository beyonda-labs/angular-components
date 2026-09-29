import { TreeNode } from '../../tree/models/tree.model';
import { PageCategoriesConfig, PageMoveTarget } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { isCategoryRow, readRowField } from './page-row';

export function buildMoveTargetNodes(
    prefix: string,
    categories: PageItem[],
    categoriesConfig: PageCategoriesConfig,
    selectedItems: PageItem[]
): TreeNode<PageMoveTarget>[] {
    const { nameField, parentField } = categoriesConfig;
    const childrenByParent = new Map<string | number | null, PageItem[]>();

    for (const category of categories) {
        const parentId = (readRowField(category, parentField) as string | number | null) ?? null;
        const siblings = childrenByParent.get(parentId) ?? [];

        siblings.push(category);
        childrenByParent.set(parentId, siblings);
    }

    const blockedIds = new Set<string | number>(
        selectedItems.filter(item => isCategoryRow(item, categoriesConfig)).map(item => item.id)
    );
    let frontier = [...blockedIds];

    while (frontier.length > 0) {
        const next: (string | number)[] = [];

        for (const id of frontier) {
            for (const child of childrenByParent.get(id) ?? []) {
                if (!blockedIds.has(child.id)) {
                    blockedIds.add(child.id);
                    next.push(child.id);
                }
            }
        }

        frontier = next;
    }

    const buildLevel = (parentId: string | number | null): TreeNode<PageMoveTarget>[] =>
        (childrenByParent.get(parentId) ?? []).map(
            category =>
                new TreeNode<PageMoveTarget>({
                    key: String(category.id),
                    label: String(readRowField(category, nameField) ?? ''),
                    isDisabled: blockedIds.has(category.id),
                    data: { id: category.id },
                    children: buildLevel(category.id)
                })
        );

    return [
        new TreeNode<PageMoveTarget>({
            key: '__root__',
            label: `${prefix}.categories.root`,
            data: { id: null },
            children: buildLevel(null)
        })
    ];
}
