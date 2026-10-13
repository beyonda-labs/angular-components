import { notificationTime } from './notification-time';

const MINUTE_MS = 60000;
const NOW = new Date(2026, 9, 13, 12, 0).getTime();

function translate(key: string, parameters?: Record<string, number>): string {
    return parameters ? `${key}:${parameters['count']}` : key;
}

describe('notificationTime', () => {
    it.each([
        [0, 'angular-components.notifications.time.now'],
        [30 * 1000, 'angular-components.notifications.time.now'],
        [5 * MINUTE_MS, 'angular-components.notifications.time.minutes:5'],
        [59 * MINUTE_MS, 'angular-components.notifications.time.minutes:59'],
        [3 * 60 * MINUTE_MS, 'angular-components.notifications.time.hours:3'],
        [2 * 24 * 60 * MINUTE_MS, 'angular-components.notifications.time.days:2']
    ])('says how long ago, %i ms before now', (elapsed, expected) => {
        expect(notificationTime(NOW - elapsed, NOW, 'en', translate)).toBe(expected);
    });

    it('treats a time ahead of the clock as just now', () => {
        expect(notificationTime(NOW + MINUTE_MS, NOW, 'en', translate)).toBe(
            'angular-components.notifications.time.now'
        );
    });

    it('gives the date in the language in use once a week has gone by', () => {
        const createdAt = new Date(2026, 9, 1, 9, 0).getTime();

        expect(notificationTime(createdAt, NOW, 'en', translate)).toBe('Oct 1, 2026');
        expect(notificationTime(createdAt, NOW, 'es', translate)).toBe('1 oct 2026');
    });
});
