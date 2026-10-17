import { TableColumn, TableConfig, TableRow } from '../models/table.model';
import { TableCell, TextTableCell } from '../models/table-cell.model';
import { buildRows, withSelection } from './table-rows';

interface Person {
    id: number;
    name: string;
    role: string;
}

const ADA: Person = { id: 1, name: 'Ada', role: 'Admin' };
const GRACE: Person = { id: 2, name: 'Grace', role: 'Editor' };

function buildConfig(loadRow: (person: Person) => TableCell[]): TableConfig<Person> {
    return new TableConfig<Person>({
        columns: [new TableColumn({ key: 'name' }), new TableColumn({ key: 'role' })],
        isRowSelected: person => person.id === GRACE.id,
        items: [ADA, GRACE],
        loadRow,
        prefix: 'demo'
    });
}

function contentsOf(rows: TableRow<Person>[]): unknown[][] {
    return rows.map(row => row.cells.map(cell => cell.content));
}

describe('buildRows', () => {
    it('builds a row per item with the cells of the columns shown, in their order, and its selection', () => {
        const config = buildConfig(person => [
            new TextTableCell({ content: person.name }),
            new TextTableCell({ content: person.role })
        ]);
        const rows = buildRows(config, [{ column: config.columns[1], index: 1 }]);

        expect(contentsOf(rows)).toEqual([['Admin'], ['Editor']]);
        expect(rows.map(row => [row.content, row.isSelected])).toEqual([
            [ADA, false],
            [GRACE, true]
        ]);
    });

    it('fills the cells an item leaves out with empty ones', () => {
        const config = buildConfig(person => [new TextTableCell({ content: person.name })]);
        const rows = buildRows(
            config,
            config.columns.map((column, index) => ({ column, index }))
        );

        expect(contentsOf(rows)).toEqual([
            ['Ada', ''],
            ['Grace', '']
        ]);
    });
});

describe('withSelection', () => {
    it('returns the same row with the selection given, leaving the row as it was', () => {
        const row = new TableRow({ cells: [], content: ADA });
        const selected = withSelection(row, true);

        expect([selected.content, selected.isSelected, row.isSelected]).toEqual([ADA, true, false]);
    });
});
