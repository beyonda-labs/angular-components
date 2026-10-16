import { userNameOrUnknown } from '../../../internal/user-name/user-name';
import {
    Notification,
    NOTIFICATION_LIBRARY_TYPES,
    NotificationLabels,
    NOTIFICATIONS_PREFIX,
    NotificationType
} from '../models/notifications.model';

const ACCESS_PARAMETER = 'access';
const ACCESS_VALUES: ReadonlySet<string> = new Set(['read', 'write']);
const CATEGORY_KIND = 'category';
const ENTITY_PARAMETER = 'entity';
const ITEM_KIND = 'item';
const ROWS_TRANSFERRED_KEY = `${NOTIFICATIONS_PREFIX}.types.${NotificationType.RowsTransferred}`;
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
    const parameters = notificationParameters(notification, labels, key => translate(key));

    if (notification.type === NotificationType.RowsTransferred && !labels.labels[notification.type]) {
        return rowsTransferredText(notification, labels, parameters, translate);
    }

    return translate(notificationLabelKey(notification.type, labels), parameters);
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

function rowsTransferredText(
    { parameters }: Pick<Notification, 'parameters'>,
    { entityNouns }: Pick<NotificationLabels, 'entityNouns'>,
    texts: Record<string, string>,
    translate: (key: string, parameters?: Record<string, string>) => string
): string {
    const { count, entity, kind, name } = parameters;
    const isOne = Number(count) === 1;
    const noun = kind === ITEM_KIND && typeof entity === 'string' ? entityNouns[entity] : undefined;
    const hasName = typeof name === 'string' && name.trim() !== '';
    const variant = rowsTransferredVariant(isOne, kind, hasName, noun !== undefined);

    return translate(
        `${ROWS_TRANSFERRED_KEY}.${variant}`,
        noun ? { ...texts, noun: translate(isOne ? noun.one : noun.other) } : texts
    );
}

function rowsTransferredVariant(
    isOne: boolean,
    kind: string | number | null | undefined,
    hasName: boolean,
    hasNoun: boolean
): string {
    if (isOne) {
        if (!hasName) {
            return 'unnamed';
        }

        if (kind === CATEGORY_KIND) {
            return 'folder';
        }

        return hasNoun ? 'item' : 'row';
    }

    if (kind === CATEGORY_KIND) {
        return 'folders';
    }

    return hasNoun ? 'items' : 'rows';
}
