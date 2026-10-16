import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { SessionService } from '../../../services/session/session.service';
import { Notification, NotificationsConfig, NotificationsPage, NotificationType } from '../models/notifications.model';
import { NotificationsService } from './notifications.service';

const BASE_URL = 'https://api.test/api/notifications';
const COUNT_URL = `${BASE_URL}/unread-count`;
const INTERVAL_MS = 60000;

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, template: '' })
class EmptyPageComponent {}

function buildNotification(id: string, createdAt: number, readAt: number | null = null): Notification {
    return { createdAt, id, parameters: {}, readAt, target: null, type: NotificationType.FolderShared };
}

describe('NotificationsService', () => {
    let httpTesting: HttpTestingController;
    let service: NotificationsService;

    function countRequest(): TestRequest {
        return httpTesting.expectOne(COUNT_URL);
    }

    function answerCount(unreadCount: number): void {
        countRequest().flush({ unreadCount });
    }

    function answerPage(url: string, page: NotificationsPage): void {
        httpTesting.expectOne(url).flush(page);
    }

    function start(config = new NotificationsConfig()): void {
        service.start(config);
        TestBed.flushEffects();
    }

    function startLoaded(results: Notification[], unreadCount: number): void {
        start();
        answerCount(unreadCount);
        service.load();
        answerPage(`${BASE_URL}?limit=20`, { hasMore: false, results, unreadCount });
    }

    beforeEach(() => {
        jest.useFakeTimers();
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({ token: 'session-token' }),
                provideRouter([{ component: EmptyPageComponent, path: '**' }])
            ]
        });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(NotificationsService);
    });

    afterEach(() => {
        service.stop();
        TestBed.flushEffects();
        httpTesting.verify();
        jest.useRealTimers();
    });

    it('asks the unread count as soon as it starts, and again every minute', () => {
        start();
        answerCount(3);

        expect(service.unreadCount()).toBe(3);

        jest.advanceTimersByTime(INTERVAL_MS - 1);
        httpTesting.expectNone(COUNT_URL);
        jest.advanceTimersByTime(1);
        answerCount(5);

        expect(service.unreadCount()).toBe(5);
    });

    it('polls at the interval of the config, under its base url', () => {
        start(new NotificationsConfig({ baseUrl: '/inbox', pollIntervalMs: 1000 }));
        httpTesting.expectOne('https://api.test/api/inbox/unread-count').flush({ unreadCount: 0 });

        jest.advanceTimersByTime(1000);

        httpTesting.expectOne('https://api.test/api/inbox/unread-count').flush({ unreadCount: 1 });
    });

    it('asks nothing until it starts, nor while no session is open', () => {
        jest.advanceTimersByTime(INTERVAL_MS);
        service.refresh();
        service.load();
        httpTesting.expectNone(() => true);

        TestBed.inject(SessionService).clear();
        start();
        jest.advanceTimersByTime(INTERVAL_MS);

        httpTesting.expectNone(() => true);
    });

    it('asks once after a burst of navigations', async () => {
        start();
        answerCount(0);

        const router = TestBed.inject(Router);

        await router.navigateByUrl('/templates');
        await router.navigateByUrl('/templates/t1');
        await router.navigateByUrl('/documents');
        jest.advanceTimersByTime(300);

        answerCount(2);

        expect(service.unreadCount()).toBe(2);
    });

    it('keeps a failed poll out of the error modal, and tries again on the next one', () => {
        start();
        countRequest().flush(null, { status: 503, statusText: 'Unavailable' });

        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);

        jest.advanceTimersByTime(INTERVAL_MS);
        answerCount(1);

        expect(service.unreadCount()).toBe(1);
    });

    it('stops on sign-out and forgets what it held', () => {
        startLoaded([buildNotification('n1', 2000)], 1);

        TestBed.inject(SessionService).clear();
        TestBed.flushEffects();
        jest.advanceTimersByTime(INTERVAL_MS);

        expect([service.unreadCount(), service.notifications(), service.hasMore()]).toEqual([0, [], false]);
        httpTesting.expectNone(COUNT_URL);
    });

    it('stops polling when it is stopped', () => {
        start();
        answerCount(0);

        service.stop();
        TestBed.flushEffects();
        jest.advanceTimersByTime(INTERVAL_MS);

        httpTesting.expectNone(COUNT_URL);
    });

    it('loads the newest page first and then the notices older than the last one', () => {
        start();
        answerCount(0);
        service.load();

        expect(service.isLoading()).toBe(true);

        answerPage(`${BASE_URL}?limit=20`, {
            hasMore: true,
            results: [buildNotification('n3', 3000), buildNotification('n2', 2000)],
            unreadCount: 3
        });

        expect([service.isLoading(), service.hasMore(), service.unreadCount()]).toEqual([false, true, 3]);

        service.load(true);
        answerPage(`${BASE_URL}?before=2000&limit=20`, {
            hasMore: false,
            results: [buildNotification('n2', 2000), buildNotification('n1', 1000)],
            unreadCount: 3
        });

        expect(service.notifications().map(({ id }) => id)).toEqual(['n3', 'n2', 'n1']);

        service.load(true);
        httpTesting.expectNone(() => true);
    });

    it('starts over from the newest page on a plain load', () => {
        startLoaded([buildNotification('n1', 1000)], 1);

        service.load();
        answerPage(`${BASE_URL}?limit=20`, {
            hasMore: false,
            results: [buildNotification('n2', 2000)],
            unreadCount: 1
        });

        expect(service.notifications().map(({ id }) => id)).toEqual(['n2']);
    });

    it('marks an unread notice read once, and counts one less', () => {
        startLoaded([buildNotification('n2', 2000), buildNotification('n1', 1000)], 2);

        service.markRead('n1');
        httpTesting.expectOne(`${BASE_URL}/n1/read`).flush(null, { status: 204, statusText: 'No Content' });
        service.markRead('n1');

        httpTesting.expectNone(() => true);
        expect(service.notifications().map(({ readAt }) => readAt !== null)).toEqual([false, true]);
        expect(service.unreadCount()).toBe(1);
    });

    it('asks the count again after marking read a notice it has not loaded', () => {
        start();
        answerCount(2);

        service.markRead('n9');
        httpTesting.expectOne(`${BASE_URL}/n9/read`).flush(null, { status: 204, statusText: 'No Content' });
        answerCount(1);

        expect(service.unreadCount()).toBe(1);
    });

    it('marks every notice read at once', () => {
        startLoaded([buildNotification('n2', 2000), buildNotification('n1', 1000, 1500)], 1);

        service.markAllRead();
        httpTesting.expectOne(`${BASE_URL}/read-all`).flush({ updated: 1 });

        expect(service.notifications().map(({ readAt }) => readAt !== null)).toEqual([true, true]);
        expect(service.notifications()[1].readAt).toBe(1500);
        expect(service.unreadCount()).toBe(0);
    });
});
