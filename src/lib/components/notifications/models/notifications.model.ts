export enum NotificationType {
    ContentTransferred = 'users.content-transferred',
    EditLockReleased = 'edit-locks.released',
    FolderShared = 'sharing.folder-shared'
}

export interface Notification {
    createdAt: number;
    id: string;
    parameters: Readonly<Record<string, string | number | null>>;
    readAt: number | null;
    target: NotificationTarget | null;
    type: string;
}

export interface NotificationLabels {
    entityLabels: Readonly<Record<string, string>>;
    labels: Readonly<Record<string, string>>;
}

export interface NotificationsMarkAllReadResponse {
    updated: number;
}

export interface NotificationsPage {
    hasMore: boolean;
    results: Notification[];
    unreadCount: number;
}

export interface NotificationsUnreadCount {
    unreadCount: number;
}

export interface NotificationTarget {
    entity: string;
    id: string | null;
}

export class NotificationsConfig {
    baseUrl: string;
    entityLabels: Readonly<Record<string, string>>;
    labels: Readonly<Record<string, string>>;
    pageSize: number;
    pollIntervalMs: number;

    link?: (notification: Notification) => string | null;

    constructor({
        baseUrl = '/notifications',
        entityLabels = {},
        labels = {},
        link,
        pageSize = 20,
        pollIntervalMs = 60000
    }: NotificationsConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.entityLabels = entityLabels;
        this.labels = labels;
        this.link = link;
        this.pageSize = pageSize;
        this.pollIntervalMs = pollIntervalMs;
    }
}

export interface NotificationsConfigParameters {
    baseUrl?: string;
    entityLabels?: Readonly<Record<string, string>>;
    labels?: Readonly<Record<string, string>>;
    link?: (notification: Notification) => string | null;
    pageSize?: number;
    pollIntervalMs?: number;
}

export const NOTIFICATION_LIBRARY_TYPES: readonly string[] = Object.values(NotificationType);

export const NOTIFICATIONS_BADGE_MAX = 99;

export const NOTIFICATIONS_MARK_ALL_READ_PATH = '/read-all';

export const NOTIFICATIONS_NAVIGATION_DEBOUNCE_MS = 300;

export const NOTIFICATIONS_PREFIX = 'angular-components.notifications';

export const NOTIFICATIONS_UNREAD_COUNT_PATH = '/unread-count';
