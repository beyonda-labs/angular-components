import { auditDetailEntries } from './audit-details';

describe('auditDetailEntries', () => {
    it('lists every detail of an event as text, writing a list or an object as JSON', () => {
        expect(
            auditDetailEntries({
                details: { count: 3, ids: ['u1', 'u2'], isForced: false, name: 'Sales', target: { id: 'o1' } }
            })
        ).toEqual([
            { key: 'count', value: '3' },
            { key: 'ids', value: '["u1","u2"]' },
            { key: 'isForced', value: 'false' },
            { key: 'name', value: 'Sales' },
            { key: 'target', value: '{"id":"o1"}' }
        ]);
    });

    it('leaves a detail without a value empty', () => {
        expect(auditDetailEntries({ details: { reason: null, source: undefined } })).toEqual([
            { key: 'reason', value: '' },
            { key: 'source', value: '' }
        ]);
    });

    it('lists nothing for an event without details', () => {
        expect(auditDetailEntries({})).toEqual([]);
    });
});
