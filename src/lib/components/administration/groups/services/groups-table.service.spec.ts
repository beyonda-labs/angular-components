import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { DateTableCell, LinkTableCell, TextTableCell } from '../../../table/models/table-cell.model';
import { GroupRow, GroupsPageMode, GroupsRowOptions } from '../models/groups.model';
import { GroupsTableService } from './groups-table.service';

describe('GroupsTableService', () => {
    let options: GroupsRowOptions;
    let service: GroupsTableService;

    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return {
            actions: ['edit'],
            createdAt: 1_000,
            extraRoleCount: 2,
            id: 'g1',
            memberCount: 4,
            name: 'Sales',
            organizationId: 'o2',
            organizationName: 'Globex',
            ...overrides
        };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        options = {
            isOrganizationShown: false,
            mode: GroupsPageMode.Manage,
            onEdit: jest.fn(),
            onView: jest.fn(),
            prefix: 'demo.groups'
        };
        service = TestBed.inject(GroupsTableService);
    });

    it('fills a cell per column: name, member count, extra role count, role count and creation', () => {
        const [name, memberCount, extraRoleCount, roleCount, created, ...rest] = service.loadRow(
            buildGroup({ roleCount: 3 }),
            options
        );

        expect(name.content).toBe('Sales');
        expect([memberCount.content, extraRoleCount.content, roleCount.content]).toEqual(['4', '2', '3']);
        expect((created as DateTableCell).value).toBe(1_000);
        expect(rest).toEqual([]);
    });

    it('counts no extra role nor role for a group of a server that answers no count', () => {
        const cells = service.loadRow(buildGroup({ extraRoleCount: undefined }), options);

        expect([cells[2].content, cells[3].content]).toEqual(['0', '0']);
    });

    it('fills the organization after the extra role count when it is shown', () => {
        const [name, memberCount, extraRoleCount, organization, roleCount, created] = service.loadRow(buildGroup(), {
            ...options,
            isOrganizationShown: true
        });

        expect([
            name.content,
            memberCount.content,
            extraRoleCount.content,
            organization.content,
            roleCount.content
        ]).toEqual(['Sales', '4', '2', 'Globex', '0']);
        expect((created as DateTableCell).value).toBe(1_000);
    });

    it('opens the edit form from the name of a group the caller may edit', () => {
        const group = buildGroup();
        const [name] = service.loadRow(group, options);

        (name as LinkTableCell).action();

        expect(options.onEdit).toHaveBeenCalledWith(group);
    });

    it('shows the name as text for a group the caller may not edit', () => {
        const [name] = service.loadRow(buildGroup({ actions: [] }), options);

        expect(name).toBeInstanceOf(TextTableCell);
        expect(name.content).toBe('Sales');
    });

    it('opens the view of a group from its name when its row lists view', () => {
        const group = buildGroup({ actions: ['view'] });
        const [name] = service.loadRow(group, options);

        (name as LinkTableCell).action();

        expect(options.onView).toHaveBeenCalledWith(group);
    });

    describe('reading the own groups of a member', () => {
        const member = buildGroup({ actions: [], extraRoleCount: undefined, roleCount: 3 });

        it('opens the view of a group from its name', () => {
            const [name] = service.loadRow(member, { ...options, mode: GroupsPageMode.Read });

            (name as LinkTableCell).action();

            expect(name.tooltip).toBe('demo.groups.table.view-group');
            expect(options.onView).toHaveBeenCalledWith(member);
        });
    });
});
