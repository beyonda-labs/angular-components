import { NOTIFICATIONS_PREFIX } from '../models/notifications.model';

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;
const TIME_PREFIX = `${NOTIFICATIONS_PREFIX}.time`;
const WEEK_MS = 7 * DAY_MS;

export function notificationTime(
    createdAt: number,
    now: number,
    language: string,
    translate: (key: string, parameters?: Record<string, number>) => string
): string {
    const elapsed = Math.max(0, now - createdAt);

    if (elapsed < MINUTE_MS) {
        return translate(`${TIME_PREFIX}.now`);
    }

    if (elapsed < HOUR_MS) {
        return translate(`${TIME_PREFIX}.minutes`, { count: Math.floor(elapsed / MINUTE_MS) });
    }

    if (elapsed < DAY_MS) {
        return translate(`${TIME_PREFIX}.hours`, { count: Math.floor(elapsed / HOUR_MS) });
    }

    if (elapsed < WEEK_MS) {
        return translate(`${TIME_PREFIX}.days`, { count: Math.floor(elapsed / DAY_MS) });
    }

    return new Intl.DateTimeFormat(language || undefined, { dateStyle: 'medium' }).format(new Date(createdAt));
}
