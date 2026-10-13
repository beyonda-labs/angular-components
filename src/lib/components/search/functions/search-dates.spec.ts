import { dateInputValue, dayEnd, dayStart } from './search-dates';

describe('search-dates', () => {
    it('reads a day of the date input as its first millisecond, local time', () => {
        expect(dayStart('2026-10-13')).toBe(new Date(2026, 9, 13).getTime());
    });

    it('reads a day of the date input as its last millisecond, local time', () => {
        expect(dayEnd('2026-10-13')).toBe(new Date(2026, 9, 14).getTime() - 1);
    });

    it('reads nothing from a value that is not a day', () => {
        expect(dayStart('')).toBeNull();
        expect(dayStart('13/10/2026')).toBeNull();
        expect(dayStart('2026-02-30')).toBeNull();
        expect(dayEnd('later')).toBeNull();
    });

    it('writes a moment as the day of the date input it falls on, local time', () => {
        expect(dateInputValue(new Date(2026, 0, 5, 23, 59).getTime())).toBe('2026-01-05');
        expect(dateInputValue(dayEnd('2026-10-13'))).toBe('2026-10-13');
    });

    it('writes nothing for a value that is not a moment', () => {
        expect(dateInputValue(undefined)).toBe('');
        expect(dateInputValue('2026-10-13')).toBe('');
        expect(dateInputValue(Number.NaN)).toBe('');
    });
});
