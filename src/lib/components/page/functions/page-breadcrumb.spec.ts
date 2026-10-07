import { PageViewMode } from '../models/page-categories.model';
import { buildPageBreadcrumbItems } from './page-breadcrumb';

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
});
