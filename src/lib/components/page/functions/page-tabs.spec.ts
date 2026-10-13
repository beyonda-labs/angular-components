import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { PageConfig } from '../models/page.model';
import { PageTableConfig, PageTableConfigParameters } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { buildPageTabs, readViewFilters } from './page-tabs';

const BLOCKS = new PageView({
    filters: [new StringFilter({ field: 'kind', operator: SearchFilterOperator.Equals, value: 'block' })],
    key: 'blocks'
});

function buildConfig(
    isTrashEnabled: boolean,
    views: PageView[] = [],
    overrides: Partial<PageTableConfigParameters> = {}
): PageConfig {
    return new PageConfig({
        prefix: 'demo',
        tableConfig: new PageTableConfig({ columns: [], isTrashEnabled, loadRow: () => [], ...overrides }),
        views
    });
}

describe('buildPageTabs', () => {
    it('puts the views between the main tab and the trash', () => {
        const onTabChange = jest.fn();
        const tabs = buildPageTabs(buildConfig(true, [BLOCKS]), 'blocks', onTabChange);

        tabs?.onTabChange?.('trash');

        expect(tabs?.tabs.map(tab => tab.key)).toEqual(['table', 'blocks', 'trash']);
        expect(tabs?.activeTab).toBe('blocks');
        expect(onTabChange).toHaveBeenCalledWith('trash');
    });

    it('shows the views without a trash, and no tabs with neither', () => {
        expect(buildPageTabs(buildConfig(false, [BLOCKS]), 'table', jest.fn())?.tabs.map(tab => tab.key)).toEqual([
            'table',
            'blocks'
        ]);
        expect(buildPageTabs(buildConfig(false), 'table', jest.fn())).toBeNull();
    });

    it('offers the shared view before the trash, labelled by the library, also as the only extra tab', () => {
        const withTrash = buildPageTabs(buildConfig(true, [BLOCKS], { isSharedEnabled: true }), 'shared', jest.fn());
        const alone = buildPageTabs(buildConfig(false, [], { isSharedEnabled: true }), 'table', jest.fn());

        expect(withTrash?.tabs.map(({ key, label }) => ({ key, label }))).toEqual([
            { key: 'table', label: 'table.label' },
            { key: 'blocks', label: 'blocks.label' },
            { key: 'shared', label: 'angular-components.page.shared.label' },
            { key: 'trash', label: 'trash.label' }
        ]);
        expect(alone?.tabs.map(tab => tab.key)).toEqual(['table', 'shared']);
    });
});

describe('readViewFilters', () => {
    it('answers the filters of the active view, and none outside a view', () => {
        expect(readViewFilters(buildConfig(true, [BLOCKS]), 'blocks')).toBe(BLOCKS.filters);
        expect(readViewFilters(buildConfig(true, [BLOCKS]), null)).toEqual([]);
    });
});
