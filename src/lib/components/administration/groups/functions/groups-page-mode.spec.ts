import { PageItemType } from '../../../page/models/page-categories.model';
import { GroupRow, GroupsPageMode } from '../models/groups.model';
import { groupsPageMode } from './groups-page-mode';

describe('groupsPageMode', () => {
    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return { actions: [], createdAt: 0, id: 'g1', memberCount: 3, name: 'Sales', ...overrides };
    }

    it('manages the groups when the page offers a create or a row an action', () => {
        expect(groupsPageMode(GroupsPageMode.Read, { globalActions: ['create'], results: [] })).toBe(
            GroupsPageMode.Manage
        );
        expect(
            groupsPageMode(GroupsPageMode.Read, { globalActions: [], results: [buildGroup({ actions: ['edit'] })] })
        ).toBe(GroupsPageMode.Manage);
    });

    it('reads the own groups of a member, with their roles once the rows count them', () => {
        expect(groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [buildGroup()] })).toBe(
            GroupsPageMode.Read
        );
        expect(
            groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [buildGroup({ roleCount: 2 })] })
        ).toBe(GroupsPageMode.ReadWithRoles);
    });

    it('still reads the groups of a member whose rows offer only to view them', () => {
        expect(
            groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [buildGroup({ actions: ['view'] })] })
        ).toBe(GroupsPageMode.Read);
        expect(
            groupsPageMode(GroupsPageMode.Read, {
                globalActions: [],
                results: [buildGroup({ actions: ['view', 'delete'] })]
            })
        ).toBe(GroupsPageMode.Manage);
    });

    it('tells the mode by the groups alone, the folders of the organizations left out', () => {
        const folder = { actions: [], entryType: PageItemType.Category as const, id: 'o1', name: 'Acme' };

        expect(groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [folder] })).toBe(
            GroupsPageMode.Manage
        );
        expect(groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [folder, buildGroup()] })).toBe(
            GroupsPageMode.Read
        );
    });

    it('keeps the mode it had while there are no rows to tell', () => {
        expect(groupsPageMode(GroupsPageMode.Manage, { globalActions: [], results: [] })).toBe(GroupsPageMode.Manage);
        expect(groupsPageMode(GroupsPageMode.ReadWithRoles, { globalActions: [], results: [] })).toBe(
            GroupsPageMode.ReadWithRoles
        );
    });
});
