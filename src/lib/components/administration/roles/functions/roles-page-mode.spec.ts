import { PageItemType } from '../../../page/models/page-categories.model';
import { RoleSourceType, RolesPageMode } from '../models/roles.model';
import { rolesPageMode } from './roles-page-mode';

describe('rolesPageMode', () => {
    it('reads the roles of the caller when the rows say where each role comes from', () => {
        expect(rolesPageMode(RolesPageMode.Manage, [{ sources: [{ type: RoleSourceType.Direct }] }])).toBe(
            RolesPageMode.Read
        );
    });

    it('manages the roles when the rows say nothing about where they come from', () => {
        expect(rolesPageMode(RolesPageMode.Read, [{}])).toBe(RolesPageMode.Manage);
    });

    it('tells the mode by the roles alone, the folders of the organizations left out', () => {
        const folder = { actions: [], entryType: PageItemType.Category as const, id: 'o1', name: 'Acme' };

        expect(rolesPageMode(RolesPageMode.Read, [folder])).toBe(RolesPageMode.Read);
        expect(rolesPageMode(RolesPageMode.Read, [folder, {}])).toBe(RolesPageMode.Manage);
    });

    it('keeps the mode it had while there are no rows to tell', () => {
        expect(rolesPageMode(RolesPageMode.Read, [])).toBe(RolesPageMode.Read);
        expect(rolesPageMode(RolesPageMode.Manage, [])).toBe(RolesPageMode.Manage);
    });
});
