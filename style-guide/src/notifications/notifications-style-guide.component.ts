import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyNotification,
    BeyNotificationsComponent,
    BeyNotificationsConfig,
    BeyNotificationsService,
    BeyNotificationType
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';
import { StyleGuideNotificationsService } from './services/style-guide-notifications.service';

const DAY_MS = 86400000;
const MINUTE_MS = 60000;
const PREFIX = 'angular-components-style-guide.notifications';
const REVIEW_REQUESTED = 'templates.review-requested';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyNotificationsComponent, TranslateModule],
    providers: [
        StyleGuideNotificationsService,
        { provide: BeyNotificationsService, useExisting: StyleGuideNotificationsService }
    ],
    selector: 'bey-notifications-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './notifications-style-guide.component.html'
})
export class NotificationsStyleGuideComponent {
    private readonly notificationsService = inject(StyleGuideNotificationsService);

    readonly config = new BeyNotificationsConfig({
        entityLabels: { templates: `${PREFIX}.entities.templates` },
        entityNouns: { templates: { one: `${PREFIX}.nouns.templates.one`, other: `${PREFIX}.nouns.templates.other` } },
        labels: { [REVIEW_REQUESTED]: `${PREFIX}.types.review-requested` }
    });
    readonly scenarios: StyleGuideButton[] = [
        this.scenario('mixed', () => [buildNotices()]),
        this.scenario('pages', () => {
            const notices = buildNotices();

            return [notices.slice(0, 2), notices.slice(2, 4), notices.slice(4)];
        }),
        this.scenario('empty', () => [[]])
    ];

    constructor() {
        this.notificationsService.show([buildNotices()]);
    }

    private scenario(key: string, build: () => BeyNotification[][]): StyleGuideButton {
        return { action: () => this.notificationsService.show(build()), label: `${PREFIX}.scenarios.${key}` };
    }
}

function buildNotices(): BeyNotification[] {
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
            type: REVIEW_REQUESTED
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
