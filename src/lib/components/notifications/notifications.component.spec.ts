import { HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import userNameEn from '../../internal/user-name/assets/user-name.en.json';
import notificationsEn from './assets/notifications.en.json';
import {
    Notification,
    NotificationsConfig,
    NotificationsConfigParameters,
    NotificationType
} from './models/notifications.model';
import { NotificationsComponent } from './notifications.component';

const BASE_URL = 'https://api.test/api/notifications';
const MINUTE_MS = 60000;
const NOW = new Date(2026, 9, 13, 12, 0).getTime();
const TEXTS = {
    'angular-components': {
        ...notificationsEn['angular-components'],
        ...userNameEn['angular-components'],
        'review-requested': '{{byName}} asks you to review “{{rowName}}”',
        templates: 'Templates'
    }
};

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, template: '' })
class EmptyPageComponent {}

function buildNotification(id: string, minutesAgo: number, overrides: Partial<Notification> = {}): Notification {
    return {
        createdAt: NOW - minutesAgo * MINUTE_MS,
        id,
        parameters: { access: 'write', byName: 'Grace Hopper', entity: 'templates', folderName: 'Contracts' },
        readAt: null,
        target: { entity: 'templates', id: 'f1' },
        type: NotificationType.FolderShared,
        ...overrides
    };
}

describe('NotificationsComponent', () => {
    let fixture: ComponentFixture<NotificationsComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(overrides: Partial<NotificationsConfigParameters> = {}): NotificationsConfig {
        return new NotificationsConfig({
            entityLabels: { templates: 'angular-components.templates' },
            labels: { 'templates.review-requested': 'angular-components.review-requested' },
            ...overrides
        });
    }

    async function render(config = buildConfig(), unreadCount = 2): Promise<void> {
        fixture = await renderComponent(NotificationsComponent, { config });
        httpTesting.expectOne(`${BASE_URL}/unread-count`).flush({ unreadCount });
        await settle(fixture);
    }

    function bell(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');
    }

    function dialog(): HTMLElement | null {
        return fixture.nativeElement.querySelector('[role="dialog"]');
    }

    function notices(): string[] {
        return queryAll(fixture, '[role="dialog"] li button').map(button => visibleText(button));
    }

    async function open(results: Notification[], hasMore = false, unreadCount = 2): Promise<void> {
        bell().click();
        await settle(fixture);
        httpTesting.expectOne(`${BASE_URL}?limit=20`).flush({ hasMore, results, unreadCount });
        await settle(fixture);
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    beforeEach(() => {
        jest.useFakeTimers({
            doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate', 'setInterval', 'setTimeout'],
            now: NOW
        });
        TestBed.configureTestingModule({
            imports: [NotificationsComponent],
            providers: [
                provideBeyTesting({ token: 'session-token', translations: { en: TEXTS } }),
                provideRouter([{ component: EmptyPageComponent, path: '**' }])
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        fixture.destroy();
        httpTesting.verify();
        jest.useRealTimers();
    });

    it('names the bell after the unread count, and says nothing of it once there is none', async () => {
        await render();

        expect(bell().getAttribute('aria-label')).toBe('Notifications, 2 unread');
        expect(bell().getAttribute('aria-expanded')).toBe('false');

        await open([buildNotification('n1', 5, { readAt: NOW })], false, 0);

        expect(bell().getAttribute('aria-label')).toBe('Notifications');
    });

    it('opens a dialog with the notices, newest first, their text, their time and whether they are unread', async () => {
        await render();
        await open([
            buildNotification('n2', 5),
            buildNotification('n1', 3 * 60, {
                parameters: { byName: null, entity: 'templates', rowName: 'Offer' },
                readAt: NOW,
                type: NotificationType.EditLockReleased
            })
        ]);

        expect(dialog()?.getAttribute('aria-labelledby')).toBeTruthy();
        expect(bell().getAttribute('aria-expanded')).toBe('true');
        expect(notices()).toEqual([
            'Grace Hopper shared the folder “Contracts” of Templates with you, read and write 5 min ago Unread',
            'Unknown released your editing of “Offer” (Templates) 3 h ago'
        ]);
    });

    it('labels the types of the app, and gives a generic text to a type nobody labels', async () => {
        await render();
        await open([
            buildNotification('n2', 0, {
                parameters: { byName: 'Ada', rowName: 'Offer' },
                type: 'templates.review-requested'
            }),
            buildNotification('n1', 0, { type: 'billing.invoice-paid' })
        ]);

        expect(notices()).toEqual([
            'Ada asks you to review “Offer” Just now Unread',
            'You have a new notification Just now Unread'
        ]);
    });

    it('says there is nothing to show when the user has no notices', async () => {
        await render(buildConfig(), 0);
        await open([], false, 0);

        expect(dialog()?.textContent).toContain('You have no notifications');
        expect(buttonByName(fixture, 'Mark all as read').disabled).toBe(true);
    });

    it('shows more notices, older than the last one, while there are more', async () => {
        await render();
        await open([buildNotification('n2', 5)], true);
        await click(buttonByName(fixture, 'Show more'));
        httpTesting
            .expectOne(`${BASE_URL}?before=${NOW - 5 * MINUTE_MS}&limit=20`)
            .flush({ hasMore: false, results: [buildNotification('n1', 10)], unreadCount: 2 });
        await settle(fixture);

        expect(notices()).toHaveLength(2);
        expect(queryButton(fixture, 'Show more')).toBeNull();
    });

    it('reloads the notices at once from the refresh button', async () => {
        await render();
        await open([buildNotification('n1', 5)]);
        await click(buttonByName(fixture, 'Refresh'));
        httpTesting.expectOne(`${BASE_URL}?limit=20`).flush({
            hasMore: false,
            results: [buildNotification('n2', 0), buildNotification('n1', 5)],
            unreadCount: 2
        });
        await settle(fixture);

        expect(notices()).toHaveLength(2);
    });

    it('marks every notice read', async () => {
        await render();
        await open([buildNotification('n2', 5), buildNotification('n1', 10)]);
        await click(buttonByName(fixture, 'Mark all as read'));
        httpTesting.expectOne(`${BASE_URL}/read-all`).flush({ updated: 2 });
        await settle(fixture);

        expect(notices().some(text => text.endsWith('Unread'))).toBe(false);
        expect(bell().getAttribute('aria-label')).toBe('Notifications');
    });

    it('marks a notice read when it is opened, and follows the route the app links it to', async () => {
        const link = jest.fn((notification: Notification) =>
            notification.target ? `/templates/folders/${notification.target.id}` : null
        );

        await render(buildConfig({ link }));
        await open([buildNotification('n1', 5)]);
        await click(queryAll(fixture, '[role="dialog"] li button')[0]);
        httpTesting.expectOne(`${BASE_URL}/n1/read`).flush(null, { status: 204, statusText: 'No Content' });
        await settle(fixture);

        expect(link).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
        expect(TestBed.inject(Router).url).toBe('/templates/folders/f1');
        expect(dialog()).toBeNull();
        expect(bell().getAttribute('aria-label')).toBe('Notifications, 1 unread');
    });

    it('keeps the dialog open after opening a notice the app links nowhere', async () => {
        await render();
        await open([buildNotification('n1', 5, { readAt: NOW })]);
        await click(queryAll(fixture, '[role="dialog"] li button')[0]);

        expect(dialog()).not.toBeNull();
        expect(TestBed.inject(Router).url).toBe('/');
    });

    it('closes on Escape and gives the focus back to the bell', async () => {
        await render();
        await open([]);

        dialog()?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
        await settle(fixture);

        expect(dialog()).toBeNull();
        expect(document.activeElement).toBe(bell());
    });

    it('closes on a click outside it, and from the bell again', async () => {
        await render();
        await open([]);
        document.body.click();
        await settle(fixture);

        expect(dialog()).toBeNull();

        await open([]);
        await click(bell());

        expect(dialog()).toBeNull();
    });
});
