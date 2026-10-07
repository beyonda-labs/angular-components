import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { PageConfig } from '../models/page.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { buildPageTabs, readViewFilters } from './page-tabs';

const BLOCKS = new PageView({
    filters: [new StringFilter({ field: 'kind', operator: SearchFilterOperator.Equals, value: 'block' })],
    key: 'blocks'
});

function buildConfig(isTrashEnabled: boolean, views: PageView[] = []): PageConfig {
    return new PageConfig({
        prefix: 'demo',
        tableConfig: new PageTableConfig({ columns: [], isTrashEnabled, loadRow: () => [] }),
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
});

describe('readViewFilters', () => {
    it('answers the filters of the active view, and none outside a view', () => {
        expect(readViewFilters(buildConfig(true, [BLOCKS]), 'blocks')).toBe(BLOCKS.filters);
        expect(readViewFilters(buildConfig(true, [BLOCKS]), null)).toEqual([]);
    });
});
