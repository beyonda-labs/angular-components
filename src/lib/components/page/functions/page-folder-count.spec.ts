import { BreadcrumbItem } from '../../breadcrumb/models/breadcrumb.model';
import { withFolderCount } from './page-folder-count';

describe('withFolderCount', () => {
    const ROOT = new BreadcrumbItem({ id: 0, isTranslationKey: true, label: 'demo.categories.root' });
    const FOLDER = new BreadcrumbItem({ id: 1, label: 'Clients' });

    it('adds the count to the last item only, in the many form unless it is one', () => {
        const [root, folder] = withFolderCount([ROOT, FOLDER], 4);

        expect(root).toBe(ROOT);
        expect(folder).toEqual(
            expect.objectContaining({
                detail: 'angular-components.page.count.many',
                detailParameters: { count: 4 },
                id: 1,
                label: 'Clients'
            })
        );
        expect(withFolderCount([ROOT], 1)[0]).toEqual(
            expect.objectContaining({
                detail: 'angular-components.page.count.one',
                isTranslationKey: true,
                label: 'demo.categories.root'
            })
        );
        expect(withFolderCount([ROOT], 0)[0].detail).toBe('angular-components.page.count.many');
    });

    it('leaves an empty trail alone and never writes into the items', () => {
        withFolderCount([ROOT, FOLDER], 2);

        expect(withFolderCount([], 3)).toEqual([]);
        expect(FOLDER.detail).toBeUndefined();
    });
});
