import { TableColumn } from '../../table/models/table.model';
import { withColumnTooltips } from './page-columns';

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
