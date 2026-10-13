import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PageSearch } from '../../../page/models/page-search.model';
import { SearchFilterOperator } from '../../../search/models/search-filter.model';
import { AuditEventRow } from '../models/audit.model';
import { AuditHttpService } from './audit-http.service';

const LOG_URL = 'https://api.test/api/logs';

describe('AuditHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: AuditHttpService;

    const event: AuditEventRow = {
        action: 'sign-in',
        actions: ['view'],
        entity: 'auth',
        entityId: null,
        entityName: null,
        id: 'e/1',
        ip: '10.0.0.1',
        occurredAt: 1_000,
        organizationId: 'o1',
        requestId: 'req-1',
        userEmail: 'ada@example.test',
        userId: 'u1',
        userName: 'Ada Lovelace'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(AuditHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads one event by its id', () => {
        const answers: unknown[] = [];

        service.loadEvent('/logs', 'e/1').subscribe(loaded => answers.push(loaded));
        httpTesting.expectOne(`${LOG_URL}/e%2F1`).flush(event);

        expect(answers).toEqual([event]);
    });

    it('downloads the CSV of the events the search selects', () => {
        const answers: Blob[] = [];
        const search: PageSearch = {
            filters: [{ field: 'entity', operator: SearchFilterOperator.Equals, value: 'users' }],
            page: 1,
            size: 25,
            text: 'ada'
        };
        const content = new Blob(['id\n'], { type: 'text/csv' });

        service.exportEvents('/logs', search).subscribe(answer => answers.push(answer));
        const request = httpTesting.expectOne(current => current.url === `${LOG_URL}/export`);
        request.flush(content);

        expect(request.request.responseType).toBe('blob');
        expect(JSON.parse(atob(request.request.params.get('search') ?? ''))).toEqual(search);
        expect(answers).toEqual([content]);
    });

    it('searches the users of the events by the text typed, at most as many as asked', () => {
        const answers: unknown[] = [];
        const options = [{ label: 'Ada Lovelace (ada@example.test)', value: 'u1' }];

        service.searchUsers('/logs', 'ada love', 20).subscribe(answer => answers.push(answer));
        const request = httpTesting.expectOne(current => current.url === `${LOG_URL}/user-options`);
        request.flush({ hasMore: true, options });

        expect(request.request.urlWithParams).toBe(`${LOG_URL}/user-options?limit=20&search=ada%20love`);
        expect(answers).toEqual([{ hasMore: true, options }]);
    });

    it('reads no users and nothing more from a server that answers neither', () => {
        const answers: unknown[] = [];

        service.searchUsers('/logs', '', 20).subscribe(answer => answers.push(answer));
        httpTesting.expectOne(current => current.url === `${LOG_URL}/user-options`).flush({});

        expect(answers).toEqual([{ hasMore: false, options: [] }]);
    });
});
