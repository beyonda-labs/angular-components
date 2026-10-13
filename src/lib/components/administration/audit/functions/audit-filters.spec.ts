import { AUDIT_LIBRARY_ACTIONS, AUDIT_LIBRARY_ENTITIES } from '../models/audit.model';
import { auditActionOptions, auditEntityOptions } from './audit-filters';

describe('audit filters', () => {
    describe('auditActionOptions', () => {
        it('offers every library verb with its library label', () => {
            const options = auditActionOptions({ actionLabels: {} });

            expect(options.map(({ value }) => value)).toEqual(AUDIT_LIBRARY_ACTIONS);
            expect(options[0]).toEqual({ label: 'angular-components.audit.verbs.create', value: 'create' });
        });

        it('adds the verbs of the app after them, once each, with the labels the app gives', () => {
            const options = auditActionOptions({
                actionLabels: { publish: 'my-app.audit.verbs.publish', 'sign-in': 'my-app.audit.verbs.log-in' }
            });

            expect(options.map(({ value }) => value)).toEqual([...AUDIT_LIBRARY_ACTIONS, 'publish']);
            expect(options.find(({ value }) => value === 'sign-in')?.label).toBe('my-app.audit.verbs.log-in');
            expect(options.at(-1)).toEqual({ label: 'my-app.audit.verbs.publish', value: 'publish' });
        });
    });

    describe('auditEntityOptions', () => {
        it('offers the entities of the app first and then the library ones, once each', () => {
            const options = auditEntityOptions({
                entityLabels: { templates: 'my-app.audit.entities.templates', users: 'my-app.audit.entities.people' }
            });

            expect(options.map(({ value }) => value)).toEqual([
                'templates',
                'users',
                ...AUDIT_LIBRARY_ENTITIES.filter(entity => entity !== 'users')
            ]);
            expect(options.slice(0, 3)).toEqual([
                { label: 'my-app.audit.entities.templates', value: 'templates' },
                { label: 'my-app.audit.entities.people', value: 'users' },
                { label: 'angular-components.audit.entities.auth', value: 'auth' }
            ]);
        });
    });
});
