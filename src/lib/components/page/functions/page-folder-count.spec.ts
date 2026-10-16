import { BreadcrumbItem, BreadcrumbText } from '../../breadcrumb/models/breadcrumb.model';
import { PAGE_CATEGORY_COUNT_LABELS, PAGE_ITEM_COUNT_LABELS } from '../models/page-categories.model';
import { withFolderCount } from './page-folder-count';

const LABELS = { countLabels: PAGE_CATEGORY_COUNT_LABELS, itemCountLabels: PAGE_ITEM_COUNT_LABELS };

describe('withFolderCount', () => {
    const ROOT = new BreadcrumbItem({ id: 0, isTranslationKey: true, label: 'demo.categories.root' });
    const FOLDER = new BreadcrumbItem({ id: 1, label: 'Clients' });

    function text(key: string, count: number): BreadcrumbText {
        return new BreadcrumbText({ key, parameters: { count } });
    }

    it('counts the folders apart from the items on the last item only, each in the one or other form', () => {
        const [root, folder] = withFolderCount([ROOT, FOLDER], { categoryTotal: 2, total: 6 }, LABELS);

        expect(root).toBe(ROOT);
        expect(folder).toEqual(
            expect.objectContaining({
                detail: 'angular-components.page.count.mixed',
                detailParameters: {
                    categories: text('angular-components.page.count.categories.other', 2),
                    items: text('angular-components.page.count.items.other', 4)
                },
                id: 1,
                label: 'Clients'
            })
        );
        expect(withFolderCount([ROOT], { categoryTotal: 1, total: 2 }, LABELS)[0].detailParameters).toEqual({
            categories: text('angular-components.page.count.categories.one', 1),
            items: text('angular-components.page.count.items.one', 1)
        });
    });

    it('counts the items alone when the list holds no folder or does not say, with the labels of the page', () => {
        const labels = { ...LABELS, itemCountLabels: { one: 'demo.count.one', other: 'demo.count.other' } };

        expect(withFolderCount([ROOT], { categoryTotal: 0, total: 4 }, labels)[0]).toEqual(
            expect.objectContaining({
                detail: 'angular-components.page.count.items-only',
                detailParameters: { items: text('demo.count.other', 4) },
                isTranslationKey: true,
                label: 'demo.categories.root'
            })
        );
        expect(withFolderCount([ROOT], { categoryTotal: 0, total: 1 }, labels)[0].detailParameters).toEqual({
            items: text('demo.count.one', 1)
        });
        expect(withFolderCount([ROOT], { total: 3 }, labels)[0].detailParameters).toEqual({
            items: text('demo.count.other', 3)
        });
    });

    it('leaves an empty trail alone and never writes into the items', () => {
        withFolderCount([ROOT, FOLDER], { categoryTotal: 0, total: 2 }, LABELS);

        expect(withFolderCount([], { categoryTotal: 0, total: 3 }, LABELS)).toEqual([]);
        expect(FOLDER.detail).toBeUndefined();
    });
});
