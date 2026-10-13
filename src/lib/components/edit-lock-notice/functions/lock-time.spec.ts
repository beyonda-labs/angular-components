import { describeLockTime } from './lock-time';

describe('describeLockTime', () => {
    const acquiredAt = new Date(2026, 9, 11, 9, 5).getTime();

    it('marks a time of the same day as today, in the language given', () => {
        expect(describeLockTime(acquiredAt, 'es', new Date(2026, 9, 11, 18, 0).getTime())).toEqual({
            date: '11 oct 2026',
            isToday: true,
            time: '9:05'
        });
    });

    it('marks a time of an earlier day, with its date in the language given', () => {
        expect(describeLockTime(acquiredAt, 'en', new Date(2026, 9, 12, 8, 0).getTime())).toEqual({
            date: 'Oct 11, 2026',
            isToday: false,
            time: '9:05 AM'
        });
    });
});
