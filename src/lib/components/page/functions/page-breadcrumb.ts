import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_SHARED_LABEL } from '../models/page-sharing.model';
import { PageCategoryPathEntry } from '../models/page-state.model';
import { readRowField } from './page-row';

export function buildCategoryPath(path: PageItem[], nameField: string): PageCategoryPathEntry[] {
    return path.map(ancestor => ({ id: ancestor.id, label: String(readRowField(ancestor, nameField) ?? '') }));
}

export function buildPageBreadcrumbItems(
    prefix: string,
    viewMode: PageViewMode,
    categoryPath: PageCategoryPathEntry[]
): BreadcrumbItem[] {
    if (viewMode === PageViewMode.Trash) {
        return [new BreadcrumbItem({ id: 0, isTranslationKey: true, label: `${prefix}.tabs.trash.label` })];
    }

    const root = viewMode === PageViewMode.Shared ? PAGE_SHARED_LABEL : `${prefix}.categories.root`;

    return [
        new BreadcrumbItem({ id: 0, isTranslationKey: true, label: root }),
        ...categoryPath.map((entry, index) => new BreadcrumbItem({ id: index + 1, label: entry.label }))
    ];
}

export function fromSharedRoot(path: PageCategoryPathEntry[], sharedRootId: string | number): PageCategoryPathEntry[] {
    const start = path.findIndex(entry => String(entry.id) === String(sharedRootId));

    return start > 0 ? path.slice(start) : path;
}
