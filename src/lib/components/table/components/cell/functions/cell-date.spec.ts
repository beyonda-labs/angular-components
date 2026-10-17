import { DateTableCell } from '../../../models/table-cell.model';
import { toDateText } from './cell-date';

describe('toDateText', () => {
    it('formats the value in the format of the cell and the locale given', () => {
        expect(toDateText(new DateTableCell({ format: 'yyyy-MM-dd', value: new Date(2026, 9, 17) }), 'en-US')).toBe(
            '2026-10-17'
        );
        expect(toDateText(new DateTableCell({ value: new Date(2026, 9, 17) }), 'en-US')).toBe('Oct 17, 2026');
    });

    it('shows nothing for a cell without a value', () => {
        expect(toDateText(new DateTableCell({}), 'en-US')).toBe('');
        expect(toDateText(new DateTableCell({ value: null }), 'en-US')).toBe('');
        expect(toDateText(new DateTableCell({ value: '' }), 'en-US')).toBe('');
    });
});
