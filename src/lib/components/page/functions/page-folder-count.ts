import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';

const COUNT_MANY_KEY = 'angular-components.page.count.many';
const COUNT_ONE_KEY = 'angular-components.page.count.one';

export function withFolderCount(items: BreadcrumbItem[], count: number): BreadcrumbItem[] {
    const last = items[items.length - 1];

    if (!last) {
        return items;
    }

    return [
        ...items.slice(0, -1),
        new BreadcrumbItem({
            ...last,
            detail: count === 1 ? COUNT_ONE_KEY : COUNT_MANY_KEY,
            detailParameters: { count }
        })
    ];
}
