import { spansOrganizations } from './audit-organizations';

describe('spansOrganizations', () => {
    it('tells events of two organizations or more apart from those of one or none', () => {
        expect(spansOrganizations([{ organizationId: 'o1' }, { organizationId: 'o2' }])).toBe(true);
        expect(spansOrganizations([{ organizationId: 'o1' }, { organizationId: 'o1' }])).toBe(false);
        expect(spansOrganizations([])).toBe(false);
    });

    it('counts the events without an organization as one more organization', () => {
        expect(spansOrganizations([{ organizationId: null }, { organizationId: 'o1' }])).toBe(true);
        expect(spansOrganizations([{ organizationId: null }, { organizationId: null }])).toBe(false);
    });
});
