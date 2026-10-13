import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BeyAuditEventRow, BeyFormInfoField, BeyModalFormConfig } from '@beyonda-labs/angular-components';
import { buttonByName, hostOf, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { AuditStyleGuideComponent } from './audit-style-guide.component';

const AUDIT_URL = 'https://api.test/api/style-guide/audit';
const FAILED_SIGN_IN: BeyAuditEventRow = {
    action: 'sign-in-failed',
    actions: ['view'],
    entity: 'auth',
    entityId: null,
    entityName: null,
    id: 'e2',
    ip: '198.51.100.4',
    occurredAt: Date.UTC(2026, 9, 12, 8, 15),
    organizationId: null,
    requestId: 'req-2',
    userEmail: 'grace@example.test',
    userId: null,
    userName: null
};
const TEMPLATE_CREATED: BeyAuditEventRow = {
    action: 'create',
    actions: ['view'],
    entity: 'templates',
    entityId: 't1',
    entityName: 'Invoice',
    id: 'e1',
    ip: '203.0.113.7',
    occurredAt: Date.UTC(2026, 9, 12, 9, 30),
    organizationId: 'o1',
    requestId: 'req-1',
    userEmail: 'ada@example.test',
    userId: 'u1',
    userName: 'Ada Lovelace'
};

describe('AuditStyleGuideComponent', () => {
    let fixture: ComponentFixture<AuditStyleGuideComponent>;
    let httpTesting: HttpTestingController;

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    function infoLabels(form: BeyModalFormConfig | undefined): string[] {
        return (
            form?.sections
                .flatMap(({ rows }) => rows.flatMap(row => row.fields))
                .filter((field): field is BeyFormInfoField => field instanceof BeyFormInfoField)
                .flatMap(({ items }) => items.map(({ label }) => label)) ?? []
        );
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AuditStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: {
                        en: {
                            'angular-components': {
                                audit: {
                                    entities: { auth: 'Session' },
                                    verbs: { create: 'Create', 'sign-in-failed': 'Failed sign-in' },
                                    view: { none: 'Not recorded' }
                                }
                            },
                            'angular-components-style-guide': { audit: { entities: { templates: 'Templates' } } }
                        }
                    }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(AuditStyleGuideComponent);
        httpTesting
            .expectOne(request => request.url === AUDIT_URL)
            .flush({ globalActions: ['export'], results: [TEMPLATE_CREATED, FAILED_SIGN_IN] });
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the events of the demo backend, with the entities labelled by the demo', () => {
        expect(rowWith('Invoice').textContent).toContain('Ada Lovelace (ada@example.test)');
        expect(rowWith('Invoice').textContent).toContain('Templates · Create');
        expect(rowWith('Invoice').textContent).toContain('203.0.113.7');
        expect(rowWith('grace@example.test').textContent).toContain('Session · Failed sign-in');
        expect(rowWith('grace@example.test').textContent).toContain('198.51.100.4');
        expect(hostOf(fixture).textContent).not.toContain('angular-components.audit.table.columns.organization');
    });

    it('opens every field of an event and its details from the row name', async () => {
        await click(buttonByName(fixture, 'Invoice'));
        httpTesting.expectOne(`${AUDIT_URL}/e1`).flush({ ...TEMPLATE_CREATED, details: { status: 'draft' } });
        await settle(fixture);
        const form = TestBed.inject(FakeModalFormService).forms().at(-1);

        expect(form?.isSubmitHidden).toBe(true);
        expect(infoLabels(form)).toEqual([
            expect.any(String),
            'Ada Lovelace (ada@example.test)',
            'Templates · Create',
            'Invoice',
            '203.0.113.7',
            'req-1',
            'status: draft'
        ]);
    });

    it('opens an event without a row name from the view action of the header', async () => {
        await click(rowWith('grace@example.test'));
        await click(buttonByName(fixture, 'angular-components.page.actions.view.label'));
        httpTesting.expectOne(`${AUDIT_URL}/e2`).flush(FAILED_SIGN_IN);
        await settle(fixture);

        expect(infoLabels(TestBed.inject(FakeModalFormService).forms().at(-1))).toEqual([
            expect.any(String),
            'grace@example.test',
            'Session · Failed sign-in',
            'Not recorded',
            '198.51.100.4',
            'req-2'
        ]);
    });
});
