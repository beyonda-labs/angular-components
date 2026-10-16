import { NOTIFICATIONS_BADGE_MAX } from '../models/notifications.model';

export function notificationBadge(count: number): string {
    if (count <= 0) {
        return '';
    }

    return count > NOTIFICATIONS_BADGE_MAX ? `${NOTIFICATIONS_BADGE_MAX}+` : String(count);
}
