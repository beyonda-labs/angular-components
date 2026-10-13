import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { AuditComponent } from './audit.component';
import { auditTime } from './functions/audit-labels';
import { AUDIT_EXPORT_ACTION, AuditConfig, AuditEventRow } from './models/audit.model';

const AUDIT_URL = 'https://api.test/api/audit';
const MANAGER: SessionUser = {
    allowedPaths: ['/audit'],
    email: 'manager@example.test',
    organizationId: 'o2',
    redirectPath: '/audit',
    roles: ['adminuser']
};
const PREFIX = 'angular-components.audit';
const SEARCH_DEBOUNCE_MS = 350;

describe('AuditComponent', () => {
    let fixture: ComponentFixture<AuditComponent>;
    let httpTesting: HttpTestingController;
    let listRequest: TestRequest;
    let saved: { download: string; href: string }[];

    function buildEvent(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
        return {
            action: 'publish',
            actions: ['view'],
            entity: 'templates',
            entityId: 't1',
            entityName: 'Invoice',
            id: 'e1',
            ip: '10.0.0.1',
            occurredAt: Date.UTC(2026, 0, 15, 12, 0, 0),
            organizationId: 'o2',
            requestId: 'req-1',
            userEmail: 'ada@example.test',
            userId: 'u1',
            userName: 'Ada Lovelace',
            ...overrides
        };
    }

    async function render(
        events: AuditEventRow[] = [buildEvent()],
        globalActions = [AUDIT_EXPORT_ACTION]
    ): Promise<void> {
        fixture = await renderComponent(AuditComponent, {
            config: new AuditConfig({
                actionLabels: { publish: 'my-app.audit.verbs.publish' },
                entityLabels: { templates: 'my-app.audit.entities.templates' }
            })
        });
        listRequest = answerList(events, globalActions);
        await settle(fixture);
    }

    function answerList(events: AuditEventRow[], globalActions: string[] = [AUDIT_EXPORT_ACTION]): TestRequest {
        const request = httpTesting.expectOne(current => current.url === AUDIT_URL && current.method === 'GET');

        request.flush({ globalActions, results: events, search: { total: events.length } });

        return request;
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function cellsOf(rowText: string): string[] {
        return textsOf(queryAll(rowWith(rowText), '[role="cell"]'));
    }

    function viewFields(): FormInfoField[] {
        const view = TestBed.inject(FakeModalFormService).forms().at(-1);

        return (view?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? []) as FormInfoField[];
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function answerView(): Promise<void> {
        httpTesting.expectOne(`${AUDIT_URL}/e1`).flush(buildEvent({ details: { count: 2 } }));
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AuditComponent],
            providers: [provideRouter([]), provideBeyTesting({ user: MANAGER })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        saved = [];
        Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:audit'), revokeObjectURL: jest.fn() });
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            saved.push({ download: this.download, href: this.getAttribute('href') ?? '' });
        });
    });

    afterEach(() => {
        httpTesting.verify();
        jest.restoreAllMocks();
    });

    it('lists the events newest first, with when, who, what, which row and from where', async () => {
        await render([
            buildEvent(),
            buildEvent({
                action: 'sign-in',
                entity: 'auth',
                entityId: null,
                entityName: null,
                id: 'e2',
                ip: null,
                userEmail: 'grace@example.test',
                userName: null
            })
        ]);

        expect(JSON.parse(atob(listRequest.request.params.get('search') ?? ''))).toEqual(
            expect.objectContaining({ sort: { direction: 'desc', field: 'occurredAt' } })
        );
        expect(cellsOf('Invoice')).toEqual(
            expect.arrayContaining([
                auditTime(Date.UTC(2026, 0, 15, 12, 0, 0), 'en'),
                'Ada Lovelace (ada@example.test)',
                'my-app.audit.entities.templates · my-app.audit.verbs.publish',
                'Invoice',
                '10.0.0.1'
            ])
        );
        expect(cellsOf('grace@example.test')).toEqual(
            expect.arrayContaining([
                'grace@example.test',
                'angular-components.audit.entities.auth · angular-components.audit.verbs.sign-in'
            ])
        );
        expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.organization`);
    });

    it('downloads the events of the current search as a CSV file from the export button', async () => {
        await render();

        await click(buttonByName(fixture, `${PREFIX}.actions.export.label`));
        const request = httpTesting.expectOne(current => current.url === `${AUDIT_URL}/export`);
        request.flush(new Blob(['id\n'], { type: 'text/csv' }));

        expect(request.request.params.get('search')).toBe(listRequest.request.params.get('search'));
        expect(saved).toEqual([{ download: expect.stringMatching(/^audit-\d{8}\.csv$/u), href: 'blob:audit' }]);
    });

    it('offers no export while the server does not list it', async () => {
        await render([buildEvent()], []);

        expect(queryButton(fixture, `${PREFIX}.actions.export.label`)).toBeNull();
    });

    it('opens an event read from the server from the name of its row', async () => {
        await render();

        await click(buttonByName(fixture, 'Invoice'));
        await answerView();
        const view = TestBed.inject(FakeModalFormService).forms().at(-1);

        expect(view?.title).toBe(`${PREFIX}.view.title`);
        expect(view?.isSubmitHidden).toBe(true);
        expect(viewFields().map(({ key }) => key)).toEqual([
            'occurredAt',
            'user',
            'action',
            'entity',
            'ip',
            'requestId',
            'details'
        ]);
        expect(viewFields().at(-1)?.items).toEqual([{ label: 'count: 2' }]);
    });

    it('opens the selected event from the view action of the header', async () => {
        await render();

        await click(rowWith('Invoice'));
        await click(buttonByName(fixture, 'angular-components.page.actions.view.label'));
        await answerView();

        expect(TestBed.inject(FakeModalFormService).forms()).toHaveLength(1);
    });

    it('suggests the users the server finds for the text typed in the user filter', async () => {
        await render();

        await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
        await click(buttonByName(fixture, 'angular-components.search.add'));
        const [field] = queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
        field.value = 'userId';
        field.dispatchEvent(new Event('change'));
        await settle(fixture);
        const combobox = queryAll<HTMLInputElement>(fixture, '[role="combobox"]')[0];
        combobox.value = 'ada';
        combobox.dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        const request = httpTesting.expectOne(current => current.url === `${AUDIT_URL}/user-options`);
        request.flush({ hasMore: false, options: [{ label: 'Ada Lovelace (ada@example.test)', value: 'u1' }] });
        await settle(fixture);

        expect(request.request.urlWithParams).toBe(`${AUDIT_URL}/user-options?limit=20&search=ada`);
        expect(textsOf(queryAll(fixture, '[role="option"]'))).toEqual(['Ada Lovelace (ada@example.test)']);
    });
});
