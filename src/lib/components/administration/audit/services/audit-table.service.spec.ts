import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { LinkTableCell, TextTableCell } from '../../../table/models/table-cell.model';
import { auditTime } from '../functions/audit-labels';
import { AuditEventRow, AuditRowOptions } from '../models/audit.model';
import { AuditTableService } from './audit-table.service';

const UNKNOWN = 'angular-components.user-name.unknown';

describe('AuditTableService', () => {
    let options: AuditRowOptions;
    let service: AuditTableService;

    function buildEvent(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
        return {
            action: 'publish',
            actions: ['view'],
            entity: 'users',
            entityId: 't1',
            entityName: 'Invoice',
            id: 'e1',
            ip: '10.0.0.1',
            occurredAt: Date.UTC(2026, 0, 15, 12, 0, 0),
            organizationId: 'o2',
            organizationName: 'Globex',
            requestId: 'req-1',
            userEmail: 'ada@example.test',
            userId: 'u1',
            userName: 'Ada Lovelace',
            ...overrides
        };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        options = {
            actionLabels: { publish: 'my-app.audit.verbs.publish' },
            entityLabels: {},
            isOrganizationShown: false,
            onView: jest.fn()
        };
        service = TestBed.inject(AuditTableService);
    });

    it('fills a cell per column: time, user, action, row and IP', () => {
        const event = buildEvent();
        const [time, user, action, row, ip, ...rest] = service.loadRow(event, options);

        expect([time.content, time.tooltip]).toEqual([
            auditTime(event.occurredAt, 'en'),
            auditTime(event.occurredAt, 'en')
        ]);
        expect([user.content, user.tooltip]).toEqual([
            'Ada Lovelace (ada@example.test)',
            'Ada Lovelace (ada@example.test)'
        ]);
        expect(action.content).toBe('angular-components.audit.entities.users · my-app.audit.verbs.publish');
        expect([row.content, ip.content]).toEqual(['Invoice', '10.0.0.1']);
        expect(rest).toEqual([]);
    });

    it('fills the organization last when it is shown, and leaves it empty for an event of none', () => {
        const shown = { ...options, isOrganizationShown: true };

        expect(service.loadRow(buildEvent(), shown).at(-1)).toEqual(
            new TextTableCell({ content: 'Globex', tooltip: 'Globex' })
        );
        expect(service.loadRow(buildEvent({ organizationId: null }), shown).at(-1)).toEqual(
            new TextTableCell({ content: '' })
        );
    });

    it('opens the view of the event from the name of its row when the row lists view', () => {
        const event = buildEvent();
        const row = service.loadRow(event, options)[3];

        (row as LinkTableCell).action();

        expect(row.tooltip).toBe('Invoice');
        expect(options.onView).toHaveBeenCalledWith(event);
    });

    it('shows the name of the row as text when the row does not list view, and as unknown when it has no name', () => {
        const named = service.loadRow(buildEvent({ actions: [] }), options)[3];
        const unnamed = service.loadRow(buildEvent({ actions: [], entityName: null }), options)[3];

        expect(named).toEqual(new TextTableCell({ content: 'Invoice', tooltip: 'Invoice' }));
        expect(unnamed).toEqual(new TextTableCell({ content: UNKNOWN, tooltip: UNKNOWN }));
    });

    it('leaves the row and the IP empty for an event of neither', () => {
        const cells = service.loadRow(buildEvent({ entityId: null, entityName: null, ip: null }), options);

        expect(cells[3]).toEqual(new TextTableCell({ content: '' }));
        expect(cells[4].content).toBe('');
    });
});
