import { LockTime } from '../models/edit-lock-notice.model';

export function describeLockTime(timestamp: number, language: string, now: number = Date.now()): LockTime {
    const locale = language || undefined;
    const moment = new Date(timestamp);

    return {
        date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(moment),
        isToday: moment.toDateString() === new Date(now).toDateString(),
        time: new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(moment)
    };
}
