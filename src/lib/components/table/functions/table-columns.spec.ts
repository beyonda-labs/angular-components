import { TableColumn } from '../models/table.model';
import { buildColumnsMenuEntries, resolveVisibleColumns, toColumnChoices, toggleColumnChoice } from './table-columns';

const NAME = new TableColumn({ isHideable: false, key: 'name' });
const ROLE = new TableColumn({ key: 'role' });
const JOINED = new TableColumn({ isVisible: false, key: 'joinedAt' });
const COLUMNS = [NAME, ROLE, JOINED];

function keysOf(columns: TableColumn[], choices: Record<string, boolean>): string[] {
    return resolveVisibleColumns(columns, choices).map(({ column }) => column.key);
}

describe('resolveVisibleColumns', () => {
    it('shows the columns visible by default, with their index in the config', () => {
        expect(resolveVisibleColumns(COLUMNS, {})).toEqual([
            { column: NAME, index: 0 },
            { column: ROLE, index: 1 }
        ]);
    });

    it('follows the choices of the user, never hiding a column that is not hideable', () => {
        expect(keysOf(COLUMNS, { joinedAt: true, name: false, role: false })).toEqual(['name', 'joinedAt']);
    });

    it('falls back to the defaults, or to the first column, when nothing would be shown', () => {
        const role = new TableColumn({ key: 'role' });
        const hidden = new TableColumn({ isVisible: false, key: 'hidden' });

        expect(keysOf([role, JOINED], { role: false })).toEqual(['role']);
        expect(keysOf([hidden, JOINED], {})).toEqual(['hidden']);
    });
});

describe('buildColumnsMenuEntries', () => {
    it('lists the hideable columns with their header key and whether they are shown', () => {
        expect(buildColumnsMenuEntries(COLUMNS, {}, 'demo.table')).toEqual([
            { isChecked: true, isDisabled: false, key: 'role', label: 'demo.table.columns.role' },
            { isChecked: false, isDisabled: false, key: 'joinedAt', label: 'demo.table.columns.joined-at' }
        ]);
    });

    it('disables the only column left visible', () => {
        const [role] = buildColumnsMenuEntries([ROLE, JOINED], {}, 'demo.table');

        expect(role).toMatchObject({ isChecked: true, isDisabled: true });
    });
});

describe('toggleColumnChoice', () => {
    it('hides a shown column and shows a hidden one', () => {
        expect(toggleColumnChoice(COLUMNS, {}, 'role')).toEqual({ role: false });
        expect(toggleColumnChoice(COLUMNS, { role: false }, 'joinedAt')).toEqual({ joinedAt: true, role: false });
    });

    it('keeps the choices when the column cannot be hidden or is the last one shown', () => {
        const choices = { joinedAt: false };

        expect(toggleColumnChoice(COLUMNS, choices, 'name')).toBe(choices);
        expect(toggleColumnChoice([ROLE, JOINED], choices, 'role')).toBe(choices);
        expect(toggleColumnChoice(COLUMNS, choices, 'unknown')).toBe(choices);
    });
});

describe('toColumnChoices', () => {
    it('keeps only the boolean choices of a stored object', () => {
        expect(toColumnChoices({ name: 'yes', role: false })).toEqual({ role: false });
        expect(toColumnChoices(['role'])).toEqual({});
        expect(toColumnChoices(null)).toEqual({});
    });
});
