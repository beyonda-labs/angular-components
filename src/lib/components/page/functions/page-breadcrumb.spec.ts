import { PageViewMode } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { buildCategoryPath, buildPageBreadcrumbItems, fromSharedRoot } from './page-breadcrumb';

interface Folder extends PageItem {
    title?: string | number;
}

describe('buildPageBreadcrumbItems', () => {
    it('starts at the translated root and follows the folders opened, numbered from it', () => {
        const items = buildPageBreadcrumbItems('demo', PageViewMode.Table, [
            { id: 'clients', label: 'Clients' },
            { id: '2026', label: '2026' }
        ]);

        expect(items.map(({ id, isTranslationKey, label }) => ({ id, isTranslationKey, label }))).toEqual([
            { id: 0, isTranslationKey: true, label: 'demo.categories.root' },
            { id: 1, isTranslationKey: false, label: 'Clients' },
            { id: 2, isTranslationKey: false, label: '2026' }
        ]);
    });

    it('names only the trash while it is shown', () => {
        expect(
            buildPageBreadcrumbItems('demo', PageViewMode.Trash, [{ id: 'clients', label: 'Clients' }]).map(
                item => item.label
            )
        ).toEqual(['demo.tabs.trash.label']);
    });

    it('starts the shared view at the folders shared with the user', () => {
        expect(
            buildPageBreadcrumbItems('demo', PageViewMode.Shared, [{ id: 'clients', label: 'Clients' }]).map(
                item => item.label
            )
        ).toEqual(['angular-components.page.shared.label', 'Clients']);
    });
});

describe('buildCategoryPath', () => {
    it('names each folder of the path the backend answers by the name field', () => {
        const path: Folder[] = [{ id: 'clients', title: 'Clients' }, { id: 2026, title: 2026 }, { id: 'untitled' }];

        expect(buildCategoryPath(path, 'title')).toEqual([
            { id: 'clients', label: 'Clients' },
            { id: 2026, label: '2026' },
            { id: 'untitled', label: '' }
        ]);
    });
});

describe('fromSharedRoot', () => {
    const PATH = [
        { id: 'home', label: 'Home' },
        { id: 'clients', label: 'Clients' },
        { id: 2026, label: '2026' }
    ];

    it('starts the path at the shared folder, leaving out the folders of the owner above it', () => {
        expect(fromSharedRoot(PATH, 'clients')).toEqual([
            { id: 'clients', label: 'Clients' },
            { id: 2026, label: '2026' }
        ]);
    });

    it('keeps the path as it is when the shared folder is not in it', () => {
        expect(fromSharedRoot(PATH, 'elsewhere')).toBe(PATH);
    });
});
