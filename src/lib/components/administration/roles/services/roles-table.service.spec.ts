import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { BadgeTableCell, LinkTableCell } from '../../../table/models/table-cell.model';
import { RoleRow, RoleSourceType, RolesRowOptions } from '../models/roles.model';
import { RolesTableService } from './roles-table.service';

describe('RolesTableService', () => {
    let options: RolesRowOptions;
    let service: RolesTableService;

    function buildRole(overrides: Partial<RoleRow> = {}): RoleRow {
        return {
            actions: ['edit', 'delete'],
            description: 'Review the templates',
            groupCount: 3,
            id: 'r1',
            isBase: false,
            memberCount: 4,
            name: 'Reviewers',
            organizationId: 'o2',
            organizationName: 'Globex',
            permissions: ['templates.edit', 'templates.publish'],
            ...overrides
        };
    }

    function buildBase(): RoleRow {
        return buildRole({
            actions: [],
            description: undefined,
            id: 'adminuser',
            isBase: true,
            name: 'adminuser',
            organizationId: null,
            organizationName: null
        });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({
                    translations: {
                        en: {
                            demo: {
                                roles: {
                                    adminuser: 'Administrator',
                                    sources: { direct: 'Direct', group: 'Group {{names}}' }
                                }
                            }
                        }
                    }
                })
            ]
        });

        options = {
            isOrganizationShown: false,
            onEdit: jest.fn(),
            onView: jest.fn(),
            prefix: 'demo.roles',
            rolePrefix: 'demo.roles'
        };
        service = TestBed.inject(RolesTableService);
    });

    it('fills a cell per column: name, type, permission, member and group counts, origin and description', () => {
        const [name, type, permissionCount, memberCount, groupCount, origin, description, ...rest] = service.loadRow(
            buildRole(),
            options
        );

        expect(name.content).toBe('Reviewers');
        expect((type as BadgeTableCell).badges.map(({ label }) => label)).toEqual(['demo.roles.type.extra']);
        expect([
            permissionCount.content,
            memberCount.content,
            groupCount.content,
            origin.content,
            description.content
        ]).toEqual(['2', '4', '3', '', 'Review the templates']);
        expect(rest).toEqual([]);
    });

    it('counts no group for a role of a server that answers no group count', () => {
        expect(service.loadRow(buildRole({ groupCount: undefined }), options)[4].content).toBe('0');
    });

    it('labels a base role from the role prefix and types it as a base role', () => {
        const [name, type] = service.loadRow(buildBase(), options);

        expect(name.content).toBe('Administrator');
        expect((type as BadgeTableCell).badges.map(({ label }) => label)).toEqual(['demo.roles.type.base']);
    });

    it('opens the edit form from the name of a role the caller may edit', () => {
        const role = buildRole();

        (service.loadRow(role, options)[0] as LinkTableCell).action();

        expect(options.onEdit).toHaveBeenCalledWith(role);
        expect(options.onView).not.toHaveBeenCalled();
    });

    it('shows the permissions of a base role from its name, read-only', () => {
        const role = buildBase();
        const [name] = service.loadRow(role, options);

        (name as LinkTableCell).action();

        expect(name.tooltip).toBe('demo.roles.table.view-permissions');
        expect(options.onView).toHaveBeenCalledWith(role);
        expect(options.onEdit).not.toHaveBeenCalled();
    });

    it('fills the organization after the origin when it is shown, every one for a base role', () => {
        const shown = { ...options, isOrganizationShown: true };

        expect(service.loadRow(buildRole(), shown)[6].content).toBe('Globex');
        expect(service.loadRow(buildBase(), shown)[6]).toMatchObject({
            content: 'demo.roles.table.every-organization',
            translate: true
        });
    });

    describe('reading the own roles of a member', () => {
        it('says where the role comes from, directly and through each of its groups', () => {
            const role = buildRole({
                actions: [],
                groupCount: undefined,
                memberCount: undefined,
                sources: [
                    { type: RoleSourceType.Direct },
                    { groupId: 'g1', groupName: 'Sales', type: RoleSourceType.Group },
                    { groupId: 'g2', groupName: 'Support', type: RoleSourceType.Group }
                ]
            });
            const origin = service.loadRow(role, options)[5];

            expect(origin.content).toBe('Direct · Group Sales, Support');
        });

        it('says only where the role comes from', () => {
            const origin = service.loadRow(buildRole({ sources: [{ type: RoleSourceType.Direct }] }), options)[5];

            expect(origin.content).toBe('Direct');
        });
    });
});
