import { SearchFilterOperator, StringFilter } from '../../search/models/search-filter.model';
import { PageConfig, PageConfigParameters } from '../models/page.model';
import { PageCategoriesConfig, PageViewMode } from '../models/page-categories.model';
import { PageTableConfig, PageTableConfigParameters } from '../models/page-table.model';
import { PageView } from '../models/page-view.model';
import { readPageLink, withoutPageLink } from './page-link';

const BLOCKS = new PageView({
    filters: [new StringFilter({ field: 'blockType', operator: SearchFilterOperator.Equals, value: 'block' })],
    key: 'blocks'
});

function buildConfig(
    table: Partial<PageTableConfigParameters> = {},
    overrides: Partial<PageConfigParameters> = {}
): PageConfig {
    return new PageConfig({
        baseUrl: '/templates',
        prefix: 'demo',
        tableConfig: new PageTableConfig({
            categoriesConfig: new PageCategoriesConfig({}),
            columns: [],
            isSharedEnabled: true,
            isTrashEnabled: true,
            loadRow: () => [],
            ...table
        }),
        views: [BLOCKS],
        ...overrides
    });
}

describe('readPageLink', () => {
    it('answers nothing for a URL without a link', () => {
        expect(readPageLink({ tab: 'x' }, buildConfig())).toBeNull();
    });

    it('opens the main view, a view of the page, the shared view and the trash by their keys', () => {
        const config = buildConfig();

        expect([
            readPageLink({ view: 'table' }, config),
            readPageLink({ view: 'blocks' }, config),
            readPageLink({ view: 'shared' }, config),
            readPageLink({ view: 'trash' }, config)
        ]).toEqual([
            { folderId: null, view: null, viewMode: PageViewMode.Table },
            { folderId: null, view: 'blocks', viewMode: PageViewMode.Table },
            { folderId: null, view: null, viewMode: PageViewMode.Shared },
            { folderId: null, view: null, viewMode: PageViewMode.Trash }
        ]);
    });

    it('opens a folder in the view named, or in the main view when no view is named', () => {
        const config = buildConfig();

        expect(readPageLink({ folder: '7', view: 'shared' }, config)).toEqual({
            folderId: '7',
            view: null,
            viewMode: PageViewMode.Shared
        });
        expect(readPageLink({ folder: '7' }, config)).toEqual({
            folderId: '7',
            view: null,
            viewMode: PageViewMode.Table
        });
    });

    it('falls back to the main view for an unknown view, and for the shared view or the trash the page lacks', () => {
        const config = buildConfig({ isSharedEnabled: false, isTrashEnabled: false });
        const main = { folderId: null, view: null, viewMode: PageViewMode.Table };

        expect([
            readPageLink({ view: 'nope' }, config),
            readPageLink({ view: 'shared' }, config),
            readPageLink({ view: 'trash' }, config)
        ]).toEqual([main, main, main]);
    });

    it('ignores the folder in the trash, on a page without categories and on a page without a backend', () => {
        expect(readPageLink({ folder: '7', view: 'trash' }, buildConfig())?.folderId).toBeNull();
        expect(readPageLink({ folder: '7' }, buildConfig({ categoriesConfig: undefined }))?.folderId).toBeNull();
        expect(readPageLink({ folder: '7' }, buildConfig({}, { baseUrl: undefined }))?.folderId).toBeNull();
    });

    it('opens a view with a list URL of its own without the folder the link names', () => {
        const queue = new PageView({ baseUrl: '/templates/review-queue', filters: [], key: 'queue' });

        expect(readPageLink({ folder: '7', view: 'queue' }, buildConfig({}, { views: [BLOCKS, queue] }))).toEqual({
            folderId: null,
            view: 'queue',
            viewMode: PageViewMode.Table
        });
    });

    it('reads the first value of a repeated parameter and ignores an empty one', () => {
        expect(readPageLink({ folder: ['7', '8'], view: '' }, buildConfig())).toEqual({
            folderId: '7',
            view: null,
            viewMode: PageViewMode.Table
        });
        expect(readPageLink({ folder: '', view: '' }, buildConfig())).toBeNull();
    });
});

describe('withoutPageLink', () => {
    it('drops the link and keeps every other parameter', () => {
        expect(withoutPageLink({ folder: '7', tab: 'x', view: 'shared' })).toEqual({ tab: 'x' });
    });
});
