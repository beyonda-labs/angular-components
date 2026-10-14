import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { renderComponent, visibleText } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import formEn from '../../../form/assets/form.en.json';
import { FormComponent } from '../../../form/form.component';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import auditEn from '../assets/audit.en.json';
import { auditTime } from '../functions/audit-labels';
import { AuditEventRow, AuditViewOptions } from '../models/audit.model';
import { AuditFormService } from './audit-form.service';

const NONE = 'angular-components.audit.view.none';
const PREFIX = 'angular-components.audit';

describe('AuditFormService', () => {
    let service: AuditFormService;

    function buildEvent(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
        return {
            action: 'edit',
            actions: ['view'],
            entity: 'groups',
            entityId: 'g1',
            entityName: 'Sales',
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

    function buildOptions(overrides: Partial<AuditEventRow> = {}): AuditViewOptions {
        return { actionLabels: {}, entityLabels: {}, event: buildEvent(overrides), prefix: PREFIX };
    }

    function itemsByKey(overrides: Partial<AuditEventRow> = {}): Record<string, unknown[]> {
        return Object.fromEntries(
            fieldsOf<FormInfoField>(service.buildViewConfig(buildOptions(overrides)).sections).map(({ items, key }) => [
                key,
                items
            ])
        );
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(AuditFormService);
    });

    it('shows an event to read, closed with its only button', () => {
        const form = service.buildViewConfig(buildOptions());

        expect(form.title).toBe(`${PREFIX}.view.title`);
        expect(form.isSubmitHidden).toBe(true);
        expect(form.cancelLabel).toBe(`${PREFIX}.view.buttons.close`);
    });

    it('shows when it happened, who did what to which row, from where and in which request', () => {
        expect(itemsByKey()).toEqual({
            action: [{ label: 'angular-components.audit.entities.groups · angular-components.audit.verbs.edit' }],
            entity: [{ label: 'Sales', tooltip: 'g1' }],
            ip: [{ label: '10.0.0.1' }],
            occurredAt: [{ label: auditTime(Date.UTC(2026, 0, 15, 12, 0, 0), 'en') }],
            requestId: [{ label: 'req-1' }],
            user: [{ label: 'Ada Lovelace (ada@example.test)', tooltip: 'u1' }]
        });
    });

    it('says what was not recorded', () => {
        const items = itemsByKey({ entityId: null, entityName: null, ip: null, requestId: null, userId: null });

        expect([items['entity'], items['ip'], items['requestId']]).toEqual([
            [{ label: NONE, tooltip: undefined }],
            [{ label: NONE }],
            [{ label: NONE }]
        ]);
        expect(items['user']).toEqual([{ label: 'Ada Lovelace (ada@example.test)', tooltip: undefined }]);
    });

    it('shows the organization only when the server names it, and says when the event belongs to none', () => {
        expect(itemsByKey()['organization']).toBeUndefined();
        expect(itemsByKey({ organizationName: 'Globex' })['organization']).toEqual([{ label: 'Globex' }]);
        expect(itemsByKey({ organizationId: null, organizationName: null })['organization']).toEqual([{ label: NONE }]);
    });

    it('lists the details of the event last, one per line, when it has any', () => {
        const keys = Object.keys(itemsByKey({ details: { count: 2, ids: ['u1'] } }));

        expect(keys.at(-1)).toBe('details');
        expect(itemsByKey({ details: { count: 2, ids: ['u1'] } })['details']).toEqual([
            { label: 'count: 2' },
            { label: 'ids: ["u1"]' }
        ]);
        expect(itemsByKey()['details']).toBeUndefined();
    });

    it('labels every line of the view in the language of the page', async () => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', formEn);
        translate.setTranslation('en', auditEn, true);
        translate.use('en');

        const fixture = await renderComponent(FormComponent, {
            config: service.buildViewConfig(buildOptions({ details: { count: 2 }, organizationName: 'Globex' }))
        });
        const text = visibleText(fixture);

        for (const label of [
            'Date and time',
            'User',
            'Action',
            'Row',
            'Organization',
            'IP',
            'Request id',
            'Details',
            'Groups · Edit'
        ]) {
            expect(text).toContain(label);
        }

        fixture.destroy();
    });
});
