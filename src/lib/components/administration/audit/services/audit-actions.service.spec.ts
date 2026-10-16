import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fieldsOf } from '@testing/form-fields';
import { searchOf } from '@testing/page-search';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageViewMode } from '../../../page/models/page-categories.model';
import { PageSearch } from '../../../page/models/page-search.model';
import { AuditConfig, AuditEventRow } from '../models/audit.model';
import { AuditActionsService } from './audit-actions.service';

const CONFIG = new AuditConfig({
    actionLabels: { publish: 'my-app.audit.verbs.publish' },
    baseUrl: '/logs',
    entityLabels: { templates: 'my-app.audit.entities.templates' },
    prefix: 'my-app.logs'
});
const LOG_URL = 'https://api.test/api/logs';

describe('AuditActionsService', () => {
    let httpTesting: HttpTestingController;
    let page: PageHandle<AuditEventRow>;
    let saved: { download: string; href: string }[];
    let service: AuditActionsService;

    const search: PageSearch = { filters: [], page: 1, size: 25, text: 'invoice' };
    const event: AuditEventRow = {
        action: 'publish',
        actions: ['view'],
        entity: 'templates',
        entityId: 't1',
        entityName: 'Invoice',
        id: 'e1',
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

        saved = [];
        Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:audit'), revokeObjectURL: jest.fn() });
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            saved.push({ download: this.download, href: this.getAttribute('href') ?? '' });
        });
        httpTesting = TestBed.inject(HttpTestingController);
        page = {
            openCategory: jest.fn(),
            openEdit: jest.fn(),
            openForm: jest.fn(),
            refresh: jest.fn(),
            search: () => search,
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
        service = TestBed.inject(AuditActionsService);
    });

    afterEach(() => {
        httpTesting.verify();
        jest.restoreAllMocks();
    });

    it('downloads the events of the current search as a CSV file of the day', () => {
        service.exportEvents(CONFIG, page);
        const request = httpTesting.expectOne(current => current.url === `${LOG_URL}/export`);
        request.flush(new Blob(['id\n'], { type: 'text/csv' }));

        expect(searchOf(request)).toEqual(search);
        expect(saved).toEqual([{ download: expect.stringMatching(/^audit-\d{8}\.csv$/u), href: 'blob:audit' }]);
    });

    it('downloads nothing before the page is ready', () => {
        service.exportEvents(CONFIG);

        httpTesting.expectNone(`${LOG_URL}/export`);
        expect(saved).toEqual([]);
    });

    it('opens the event read from the server, labelled with the labels of the config', () => {
        const modalForms = TestBed.inject(FakeModalFormService);

        service.view(CONFIG, event);

        expect(modalForms.forms()).toEqual([]);

        httpTesting.expectOne(`${LOG_URL}/e1`).flush({ ...event, entityName: 'Invoice 2026' });
        const [view] = modalForms.forms();
        const fields = fieldsOf<FormInfoField>(view);

        expect(view.title).toBe('my-app.logs.view.title');
        expect(view.isSubmitHidden).toBe(true);
        expect(fields.find(({ key }) => key === 'action')?.items).toEqual([
            { label: 'my-app.audit.entities.templates · my-app.audit.verbs.publish' }
        ]);
        expect(fields.find(({ key }) => key === 'entity')?.items).toEqual([{ label: 'Invoice 2026', tooltip: 't1' }]);
    });
});
