import { BeyNotification, BeyNotificationType } from '@beyonda-labs/angular-components';

import { STYLE_GUIDE_REVIEW_REQUESTED } from '../models/notifications-style-guide.model';

const DAY_MS = 86400000;
const MINUTE_MS = 60000;

export function buildNotices(): BeyNotification[] {
    const now = Date.now();

    return [
        {
            createdAt: now - 5 * MINUTE_MS,
            id: 'shared',
            parameters: { access: 'write', byName: 'Grace Hopper', entity: 'templates', folderName: 'Contracts' },
            readAt: null,
            target: { entity: 'templates', id: 'folder-1' },
            type: BeyNotificationType.FolderShared
        },
        {
            createdAt: now - 2 * 60 * MINUTE_MS,
            id: 'released',
            parameters: { byName: 'Ada Lovelace', entity: 'templates', rowName: 'Offer 2026' },
            readAt: null,
            target: { entity: 'templates', id: 'template-1' },
            type: BeyNotificationType.EditLockReleased
        },
        {
            createdAt: now - DAY_MS,
            id: 'row-transferred',
            parameters: { byName: 'Grace Hopper', count: 1, entity: 'templates', kind: 'item', name: 'Contract' },
            readAt: null,
            target: { entity: 'templates', id: 'template-3' },
            type: BeyNotificationType.RowsTransferred
        },
        {
            createdAt: now - 3 * DAY_MS,
            id: 'transferred',
            parameters: { byName: null, count: 12, fromName: 'Alan Turing' },
            readAt: now - 2 * DAY_MS,
            target: null,
            type: BeyNotificationType.ContentTransferred
        },
        {
            createdAt: now - 4 * DAY_MS,
            id: 'folder-transferred',
            parameters: { byName: 'Grace Hopper', count: 1, entity: 'templates', kind: 'category', name: 'Clients' },
            readAt: now - 3 * DAY_MS,
            target: { entity: 'templates', id: 'folder-2' },
            type: BeyNotificationType.RowsTransferred
        },
        {
            createdAt: now - 5 * DAY_MS,
            id: 'rows-transferred',
            parameters: { byName: 'Ada Lovelace', count: 3, entity: 'templates', kind: 'item' },
            readAt: now - 4 * DAY_MS,
            target: { entity: 'templates', id: null },
            type: BeyNotificationType.RowsTransferred
        },
        {
            createdAt: now - 14 * DAY_MS,
            id: 'review',
            parameters: { byName: 'Grace Hopper', rowName: 'NDA' },
            readAt: now - 13 * DAY_MS,
            target: { entity: 'templates', id: 'template-2' },
            type: STYLE_GUIDE_REVIEW_REQUESTED
        },
        {
            createdAt: now - 30 * DAY_MS,
            id: 'unknown',
            parameters: {},
            readAt: now - 29 * DAY_MS,
            target: null,
            type: 'billing.invoice-paid'
        }
    ];
}
