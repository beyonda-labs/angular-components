import { BreadcrumbItem, BreadcrumbText } from '../../breadcrumb/models/breadcrumb.model';
import { PageCategoriesConfig, PageCountLabels, PageFolderCount } from '../models/page-categories.model';

const COUNT_ITEMS_ONLY_KEY = 'angular-components.page.count.items-only';
const COUNT_MIXED_KEY = 'angular-components.page.count.mixed';

export function withFolderCount(
    items: BreadcrumbItem[],
    { categoryTotal = 0, total }: PageFolderCount,
    { countLabels, itemCountLabels }: Pick<PageCategoriesConfig, 'countLabels' | 'itemCountLabels'>
): BreadcrumbItem[] {
    const last = items[items.length - 1];

    if (!last) {
        return items;
    }

    const categories = Math.min(Math.max(categoryTotal, 0), total);
    const itemsText = toCountText(total - categories, itemCountLabels);

    return [
        ...items.slice(0, -1),
        new BreadcrumbItem({
            ...last,
            detail: categories > 0 ? COUNT_MIXED_KEY : COUNT_ITEMS_ONLY_KEY,
            detailParameters:
                categories > 0
                    ? { categories: toCountText(categories, countLabels), items: itemsText }
                    : { items: itemsText }
        })
    ];
}

function toCountText(count: number, { one, other }: PageCountLabels): BreadcrumbText {
    return new BreadcrumbText({ key: count === 1 ? one : other, parameters: { count } });
}
