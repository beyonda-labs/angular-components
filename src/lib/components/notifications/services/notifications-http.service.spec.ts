import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { NotificationsPage } from '../models/notifications.model';
import { NotificationsHttpService } from './notifications-http.service';

const BASE_URL = 'https://api.test/api/inbox';

describe('NotificationsHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: NotificationsHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(NotificationsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('asks the unread count, and keeps a failure out of the error modal', () => {
        const answers: unknown[] = [];

        service
            .countUnread('/inbox')
            .subscribe({ error: () => answers.push('failed'), next: answer => answers.push(answer) });
        httpTesting.expectOne(`${BASE_URL}/unread-count`).flush({ unreadCount: 4 });
        service.countUnread('/inbox').subscribe({ error: () => answers.push('failed') });
        httpTesting.expectOne(`${BASE_URL}/unread-count`).flush(null, { status: 503, statusText: 'Unavailable' });

        expect(answers).toEqual([{ unreadCount: 4 }, 'failed']);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });

    it('lists a page of notices, older than a cursor when it has one', () => {
        const page: NotificationsPage = { hasMore: false, results: [], unreadCount: 0 };

        service.list('/inbox', 20).subscribe();
        service.list('/inbox', 20, 5000).subscribe();

        httpTesting.expectOne(`${BASE_URL}?limit=20`).flush(page);
        httpTesting.expectOne(`${BASE_URL}?before=5000&limit=20`).flush(page);
    });

    it('marks one notice read by its id, and every notice at once', () => {
        service.markRead('/inbox', 'n/1').subscribe();
        service.markAllRead('/inbox').subscribe();

        const one = httpTesting.expectOne(`${BASE_URL}/n%2F1/read`);
        const all = httpTesting.expectOne(`${BASE_URL}/read-all`);

        expect([one.request.method, all.request.method]).toEqual(['POST', 'POST']);

        one.flush(null, { status: 204, statusText: 'No Content' });
        all.flush({ updated: 2 });
    });
});
