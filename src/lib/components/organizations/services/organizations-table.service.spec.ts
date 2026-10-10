import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { BadgeVariant } from '../../badge/models/badge.model';
import { BadgeTableCell, DateTableCell, LinkTableCell, TextTableCell } from '../../table/models/table-cell.model';
import { OrganizationRow, OrganizationsRowOptions, OrganizationStatus } from '../models/organizations.model';
import { OrganizationsTableService } from './organizations-table.service';

describe('OrganizationsTableService', () => {
    let options: OrganizationsRowOptions;
    let service: OrganizationsTableService;

    function buildOrganization(overrides: Partial<OrganizationRow> = {}): OrganizationRow {
        return {
            actions: ['edit'],
            createdAt: 1_000,
            id: 'o2',
            name: 'Globex',
            status: OrganizationStatus.Active,
            userCount: 4,
            ...overrides
        };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        options = { onEdit: jest.fn(), prefix: 'demo.tenants' };
        service = TestBed.inject(OrganizationsTableService);
    });

    it('fills a cell per column: name, status, user count and creation', () => {
        const [name, status, userCount, created] = service.loadRow(buildOrganization(), options);

        expect(name.content).toBe('Globex');
        expect((status as BadgeTableCell).badges).toEqual([
            expect.objectContaining({ label: 'demo.tenants.status.active', variant: BadgeVariant.Success })
        ]);
        expect(status.translate).toBe(true);
        expect(userCount.content).toBe('4');
        expect((created as DateTableCell).value).toBe(1_000);
    });

    it('marks an inactive organization as neutral', () => {
        const [, status] = service.loadRow(buildOrganization({ status: OrganizationStatus.Inactive }), options);

        expect((status as BadgeTableCell).badges).toEqual([
            expect.objectContaining({ label: 'demo.tenants.status.inactive', variant: BadgeVariant.Neutral })
        ]);
    });

    it('opens the rename form from the name of an organization the caller may edit', () => {
        const organization = buildOrganization();
        const [name] = service.loadRow(organization, options);

        (name as LinkTableCell).action();

        expect(options.onEdit).toHaveBeenCalledWith(organization);
    });

    it('shows the name as text for an organization the caller may not edit', () => {
        const [name] = service.loadRow(buildOrganization({ actions: [] }), options);

        expect(name).toBeInstanceOf(TextTableCell);
        expect(name.content).toBe('Globex');
    });
});
