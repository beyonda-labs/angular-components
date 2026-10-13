import { userNameOrUnknown } from '../../../internal/user-name/user-name';
import {
    Notification,
    NOTIFICATION_LIBRARY_TYPES,
    NotificationLabels,
    NOTIFICATIONS_PREFIX
} from '../models/notifications.model';

const ACCESS_PARAMETER = 'access';
const ACCESS_VALUES: ReadonlySet<string> = new Set(['read', 'write']);
const ENTITY_PARAMETER = 'entity';
const TYPE_PREFIX = `${NOTIFICATIONS_PREFIX}.types`;
const UNKNOWN_TYPE_KEY = `${NOTIFICATIONS_PREFIX}.unknown-type`;

export function notificationLabelKey(type: string, { labels }: Pick<NotificationLabels, 'labels'>): string {
    return labels[type] ?? (NOTIFICATION_LIBRARY_TYPES.includes(type) ? `${TYPE_PREFIX}.${type}` : UNKNOWN_TYPE_KEY);
}

export function notificationParameters(
    { parameters }: Pick<Notification, 'parameters'>,
    { entityLabels }: Pick<NotificationLabels, 'entityLabels'>,
    translate: (key: string) => string
): Record<string, string> {
    return Object.fromEntries(
        Object.entries(parameters).map(([key, value]) => [key, parameterText(key, value, entityLabels, translate)])
    );
}

export function notificationText(
    notification: Pick<Notification, 'parameters' | 'type'>,
    labels: NotificationLabels,
    translate: (key: string, parameters?: Record<string, string>) => string
): string {
    return translate(
        notificationLabelKey(notification.type, labels),
        notificationParameters(notification, labels, key => translate(key))
    );
}

function parameterText(
    key: string,
    value: string | number | null,
    entityLabels: Readonly<Record<string, string>>,
    translate: (key: string) => string
): string {
    if (value === null || typeof value === 'number') {
        return value === null ? userNameOrUnknown(null, translate) : String(value);
    }

    if (key === ENTITY_PARAMETER) {
        return entityLabels[value] ? translate(entityLabels[value]) : value;
    }

    if (key === ACCESS_PARAMETER && ACCESS_VALUES.has(value)) {
        return translate(`${NOTIFICATIONS_PREFIX}.access.${value}`);
    }

    return userNameOrUnknown(value, translate);
}
