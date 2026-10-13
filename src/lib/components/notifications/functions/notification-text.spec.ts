import { Notification, NotificationLabels, NotificationType } from '../models/notifications.model';
import { notificationLabelKey, notificationParameters, notificationText } from './notification-text';

const LABELS: NotificationLabels = {
    entityLabels: { templates: 'app.entities.templates' },
    labels: { 'templates.review-requested': 'app.notifications.review-requested' }
};

function translate(key: string, parameters?: Record<string, string>): string {
    return parameters ? `${key} ${JSON.stringify(parameters)}` : `[${key}]`;
}

function buildNotification(overrides: Partial<Notification> = {}): Notification {
    return {
        createdAt: 1000,
        id: 'n1',
        parameters: {},
        readAt: null,
        target: null,
        type: NotificationType.FolderShared,
        ...overrides
    };
}

describe('notificationLabelKey', () => {
    it('names the text of every library type under the library prefix', () => {
        expect(Object.values(NotificationType).map(type => notificationLabelKey(type, LABELS))).toEqual([
            'angular-components.notifications.types.users.content-transferred',
            'angular-components.notifications.types.edit-locks.released',
            'angular-components.notifications.types.sharing.folder-shared'
        ]);
    });

    it('takes the key the app gives for a type, its own or one of the library', () => {
        expect(notificationLabelKey('templates.review-requested', LABELS)).toBe('app.notifications.review-requested');
        expect(
            notificationLabelKey(NotificationType.FolderShared, {
                labels: { [NotificationType.FolderShared]: 'app.shared' }
            })
        ).toBe('app.shared');
    });

    it('falls back to a generic text for a type nobody labels', () => {
        expect(notificationLabelKey('billing.invoice-paid', LABELS)).toBe(
            'angular-components.notifications.unknown-type'
        );
    });
});

describe('notificationParameters', () => {
    it('labels the entity, the access and a missing name, and writes numbers as text', () => {
        const parameters = notificationParameters(
            buildNotification({
                parameters: { access: 'write', byName: null, count: 3, entity: 'templates', folderName: 'Contracts' }
            }),
            LABELS,
            key => `[${key}]`
        );

        expect(parameters).toEqual({
            access: '[angular-components.notifications.access.write]',
            byName: '[angular-components.user-name.unknown]',
            count: '3',
            entity: '[app.entities.templates]',
            folderName: 'Contracts'
        });
    });

    it('shows the raw name of an entity the app does not label, and any other access as it comes', () => {
        const parameters = notificationParameters(
            buildNotification({ parameters: { access: 'owner', entity: 'reports' } }),
            LABELS,
            key => `[${key}]`
        );

        expect(parameters).toEqual({ access: 'owner', entity: 'reports' });
    });
});

describe('notificationText', () => {
    it('translates the label of the type with its resolved parameters', () => {
        expect(
            notificationText(
                buildNotification({
                    parameters: { byName: 'Grace', entity: 'templates', rowName: 'Offer' },
                    type: NotificationType.EditLockReleased
                }),
                LABELS,
                translate
            )
        ).toBe(
            'angular-components.notifications.types.edit-locks.released {"byName":"Grace","entity":"[app.entities.templates]","rowName":"Offer"}'
        );
    });
});
