import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { DateTableCell, LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { GroupRow, GroupsRowOptions } from '../models/groups.model';
import { GroupsTableService } from './groups-table.service';

describe('GroupsTableService', () => {
    let options: GroupsRowOptions;
    let service: GroupsTableService;

    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return {
            actions: ['edit'],
            createdAt: 1_000,
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

        options = { isOrganizationShown: false, onEdit: jest.fn() };
        service = TestBed.inject(GroupsTableService);
    });

    it('fills a cell per column: name, member count and creation', () => {
        const [name, memberCount, created, ...rest] = service.loadRow(buildGroup(), options);

        expect(name.content).toBe('Sales');
        expect(memberCount.content).toBe('4');
        expect((created as DateTableCell).value).toBe(1_000);
        expect(rest).toEqual([]);
    });

    it('fills the organization after the member count when it is shown', () => {
        const [name, memberCount, organization, created] = service.loadRow(buildGroup(), {
            ...options,
            isOrganizationShown: true
        });

        expect([name.content, memberCount.content, organization.content]).toEqual(['Sales', '4', 'Globex']);
        expect((created as DateTableCell).value).toBe(1_000);
    });

    it('opens the rename form from the name of a group the caller may edit', () => {
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
});
