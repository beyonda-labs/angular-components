import { StringFilter } from '../../search/models/search-filter.model';
import { TableColumn } from '../../table/models/table.model';
import { PageColumnContext } from '../models/page-table.model';
import { buildColumnContext, withColumnTooltips, withShownColumns } from './page-columns';

describe('buildColumnContext', () => {
    it('tells the columns the category open, if any, and whether the search sends a text or a filter', () => {
        const category = { id: 'o1', label: 'Acme' };
        const text = new StringFilter({ field: 'text', value: 'ada' });

        expect(buildColumnContext({ filters: [text], page: 1, size: 25 }, 'text', category)).toEqual({
            category,
            isSearching: true
        });
        expect(buildColumnContext({ filters: [], page: 1, size: 25 }, 'text', null)).toEqual({ isSearching: false });
    });
});

describe('withColumnTooltips', () => {
    it('reads the tooltip of each column from the table prefix, unless the column brings its own', () => {
        const columns = withColumnTooltips(
            [new TableColumn({ key: 'createdAt' }), new TableColumn({ key: 'ownerName', tooltip: 'shared.owner' })],
            'demo.table'
        );

        expect(columns.map(({ key, tooltip }) => ({ key, tooltip }))).toEqual([
            { key: 'createdAt', tooltip: 'demo.table.tooltips.created-at' },
            { key: 'ownerName', tooltip: 'shared.owner' }
        ]);
    });
});

describe('withShownColumns', () => {
    const columns = [
        new TableColumn({ key: 'name' }),
        new TableColumn({ key: 'organization' }),
        new TableColumn({ key: 'status' })
    ];
    const context: PageColumnContext = { isSearching: false };
    const isColumnShown = ({ key }: TableColumn, { isSearching }: PageColumnContext): boolean =>
        key !== 'organization' || isSearching;

    it('leaves out the entries of the columns the predicate hides in the context, columns or cells alike', () => {
        expect(withShownColumns(columns, columns, context, isColumnShown).map(({ key }) => key)).toEqual([
            'name',
            'status'
        ]);
        expect(withShownColumns(['Ada', 'Acme', 'Active'], columns, context, isColumnShown)).toEqual(['Ada', 'Active']);
        expect(withShownColumns(['Ada', 'Acme'], columns, { isSearching: true }, isColumnShown)).toEqual([
            'Ada',
            'Acme'
        ]);
    });

    it('keeps the cells past the last column and every entry without a predicate', () => {
        expect(withShownColumns(['Ada', 'Acme', 'Active', 'extra'], columns, context, isColumnShown)).toEqual([
            'Ada',
            'Active',
            'extra'
        ]);
        expect(withShownColumns(['Ada', 'Acme'], columns, context, undefined)).toEqual(['Ada', 'Acme']);
    });
});
