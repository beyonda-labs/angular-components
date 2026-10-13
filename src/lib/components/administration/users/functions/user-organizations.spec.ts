import { isOrganizationColumnShown } from './user-organizations';

describe('user organizations', () => {
    describe('isOrganizationColumnShown', () => {
        const acme = { id: 'o1', name: 'Acme' };
        const globex = { id: 'o2', name: 'Globex' };

        it('shows a superadmin the column with a single organization, since the superadmins count as one more', () => {
            expect(isOrganizationColumnShown([acme], true)).toBe(true);
            expect(isOrganizationColumnShown([acme, globex], true)).toBe(true);
        });

        it('hides the column from a superadmin who sees no organization, only the superadmins', () => {
            expect(isOrganizationColumnShown([], true)).toBe(false);
        });

        it('hides the column from anyone else, who sees a single organization', () => {
            expect(isOrganizationColumnShown([], false)).toBe(false);
            expect(isOrganizationColumnShown([acme], false)).toBe(false);
        });
    });
});
