import { AuditLabels } from '../models/audit.model';
import {
    auditActionKey,
    auditEntityKey,
    auditEventLabel,
    auditOrganizationName,
    auditRowName,
    auditTime,
    auditUserLabel
} from './audit-labels';

describe('audit labels', () => {
    const labels: AuditLabels = {
        actionLabels: { publish: 'my-app.audit.verbs.publish', 'sign-in': 'my-app.audit.verbs.log-in' },
        entityLabels: { templates: 'my-app.audit.entities.templates' }
    };
    const translations: Record<string, string> = {
        'angular-components.audit.entities.users': 'Users',
        'angular-components.audit.verbs.create': 'Create',
        'angular-components.user-name.unknown': 'Unknown',
        'my-app.audit.entities.templates': 'Templates',
        'my-app.audit.verbs.publish': 'Publish'
    };
    const translate = (key: string): string => translations[key] ?? key;

    describe('auditActionKey', () => {
        it('labels a library verb with the library key, an app verb with the key of the app, and any other by its name', () => {
            expect(auditActionKey('create', labels)).toBe('angular-components.audit.verbs.create');
            expect(auditActionKey('publish', labels)).toBe('my-app.audit.verbs.publish');
            expect(auditActionKey('archive', labels)).toBe('archive');
        });

        it('labels a library verb with the key the app gives it instead', () => {
            expect(auditActionKey('sign-in', labels)).toBe('my-app.audit.verbs.log-in');
        });
    });

    describe('auditEntityKey', () => {
        it('labels a library entity with the library key, an app entity with the key of the app, and any other by its name', () => {
            expect(auditEntityKey('organizations', labels)).toBe('angular-components.audit.entities.organizations');
            expect(auditEntityKey('templates', labels)).toBe('my-app.audit.entities.templates');
            expect(auditEntityKey('documents', labels)).toBe('documents');
        });
    });

    describe('auditEventLabel', () => {
        it('names the entity and then the verb of an event, translated', () => {
            expect(auditEventLabel({ action: 'create', entity: 'users' }, labels, translate)).toBe('Users · Create');
            expect(auditEventLabel({ action: 'publish', entity: 'templates' }, labels, translate)).toBe(
                'Templates · Publish'
            );
            expect(auditEventLabel({ action: 'archive', entity: 'documents' }, labels, translate)).toBe(
                'documents · archive'
            );
        });
    });

    describe('auditUserLabel', () => {
        it('names the user by name with the email after it, or by whichever of the two it has', () => {
            expect(auditUserLabel({ userEmail: 'ada@example.test', userName: 'Ada Lovelace' }, translate)).toBe(
                'Ada Lovelace (ada@example.test)'
            );
            expect(auditUserLabel({ userEmail: ' ada@example.test ', userName: null }, translate)).toBe(
                'ada@example.test'
            );
            expect(auditUserLabel({ userEmail: null, userName: ' Ada Lovelace ' }, translate)).toBe('Ada Lovelace');
        });

        it('names the user once when the name is the email', () => {
            expect(auditUserLabel({ userEmail: 'ada@example.test', userName: 'ada@example.test' }, translate)).toBe(
                'ada@example.test'
            );
        });

        it('names an event without a user as unknown', () => {
            expect(auditUserLabel({ userEmail: null, userName: '  ' }, translate)).toBe('Unknown');
        });
    });

    describe('auditRowName', () => {
        it('names the row of the event, as unknown when it has an id and no name, and leaves it empty without either', () => {
            expect(auditRowName({ entityId: 't1', entityName: 'Invoice' }, translate)).toBe('Invoice');
            expect(auditRowName({ entityId: 't1', entityName: null }, translate)).toBe('Unknown');
            expect(auditRowName({ entityId: null, entityName: null }, translate)).toBe('');
        });
    });

    describe('auditOrganizationName', () => {
        it('names the organization of the event, as unknown when it has no name, and leaves it empty without one', () => {
            expect(auditOrganizationName({ organizationId: 'o1', organizationName: 'Acme' }, translate)).toBe('Acme');
            expect(auditOrganizationName({ organizationId: 'o1', organizationName: null }, translate)).toBe('Unknown');
            expect(auditOrganizationName({ organizationId: null, organizationName: 'Acme' }, translate)).toBe('');
        });
    });

    describe('auditTime', () => {
        const noon = Date.UTC(2026, 0, 15, 12, 0, 0);

        it('writes the date and the time in the language given', () => {
            expect(auditTime(noon, 'en')).toContain('Jan 15, 2026');
            expect(auditTime(noon, 'es')).toContain('15 ene 2026');
        });

        it('writes them in the language of the browser when none is given', () => {
            expect(auditTime(noon, '')).toContain('2026');
        });
    });
});
