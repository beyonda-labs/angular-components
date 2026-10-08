import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageCategoryPathEntry } from '../models/page-state.model';

export function buildPageBreadcrumbItems(
    prefix: string,
    viewMode: PageViewMode,
    categoryPath: PageCategoryPathEntry[]
): BreadcrumbItem[] {
    if (viewMode === PageViewMode.Trash) {
        return [new BreadcrumbItem({ id: 0, isTranslationKey: true, label: `${prefix}.tabs.trash.label` })];
    }

    return [
        new BreadcrumbItem({ id: 0, isTranslationKey: true, label: `${prefix}.categories.root` }),
        ...categoryPath.map((entry, index) => new BreadcrumbItem({ id: index + 1, label: entry.label }))
    ];
}
