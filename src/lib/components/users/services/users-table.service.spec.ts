import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { BadgeVariant } from '../../badge/models/badge.model';
import { BadgeTableCell, DateTableCell, LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { UserRow, UsersRowOptions, UserStatus } from '../models/users.model';
import { UsersTableService } from './users-table.service';

describe('UsersTableService', () => {
    let options: UsersRowOptions;
    let service: UsersTableService;

    function buildUser(overrides: Partial<UserRow> = {}): UserRow {
        return {
            actions: ['edit'],
            createdAt: 1_000,
            email: 'ada@example.test',
            id: 'u1',
            lastLoginAt: 2_000,
            name: 'Ada',
            roles: ['admin', 'editor'],
            status: UserStatus.Invited,
            surname: 'Lovelace',
            ...overrides
        };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideBeyTesting({ translations: { en: { demo: { roles: { admin: 'Administrator' } } } } })]
        });

        options = { onEdit: jest.fn(), prefix: 'demo.users', rolePrefix: 'demo.roles' };
        service = TestBed.inject(UsersTableService);
    });

    it('fills a cell per column: name, email, roles, status, last sign-in and creation', () => {
        const [name, email, roles, status, lastLogin, created] = service.loadRow(buildUser(), options);

        expect(name.content).toBe('Ada Lovelace');
        expect(email.content).toBe('ada@example.test');
        expect((roles as BadgeTableCell).badges.map(badge => badge.label)).toEqual(['Administrator', 'editor']);
        expect((status as BadgeTableCell).badges).toEqual([
            expect.objectContaining({ label: 'demo.users.status.invited', variant: BadgeVariant.Info })
        ]);
        expect([(lastLogin as DateTableCell).value, (created as DateTableCell).value]).toEqual([2_000, 1_000]);
    });

    it('lets the table translate the status but not the roles, which arrive translated', () => {
        const cells = service.loadRow(buildUser(), options);

        expect([cells[2].translate, cells[3].translate]).toEqual([false, true]);
    });

    it('opens the edit form from the name of a user the caller may edit', () => {
        const user = buildUser();
        const [name] = service.loadRow(user, options);

        (name as LinkTableCell).action();

        expect(options.onEdit).toHaveBeenCalledWith(user);
    });

    it('shows the name as text for a user the caller may not edit, and a placeholder without one', () => {
        const [name] = service.loadRow(buildUser({ actions: [], name: undefined, surname: undefined }), options);

        expect(name).toBeInstanceOf(TextTableCell);
        expect(name.content).toBe('demo.users.table.no-name');
        expect(name.translate).toBe(true);
    });
});
