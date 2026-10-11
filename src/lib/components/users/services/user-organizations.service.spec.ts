import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { SessionUser } from '../../../services/session/models/session.model';
import { UserOrganizationsService } from './user-organizations.service';

const ORGANIZATIONS = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];
const ORGANIZATIONS_URL = 'https://api.test/api/users/organizations';

describe('UserOrganizationsService', () => {
    let httpTesting: HttpTestingController;
    let service: UserOrganizationsService;

    function configure(roles: string[], organizationId?: string): void {
        const user: SessionUser = {
            allowedPaths: ['/users'],
            email: 'ada@example.test',
            organizationId,
            redirectPath: '/users',
            roles
        };

        TestBed.configureTestingModule({ providers: [UserOrganizationsService, provideBeyTesting({ user })] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UserOrganizationsService);
    }

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the organizations for a superadmin, who belongs to none of them', () => {
        configure(['superadmin']);
        expect(service.organizations()).toBeNull();

        service.load('/users');
        httpTesting.expectOne(ORGANIZATIONS_URL).flush({ organizations: ORGANIZATIONS });

        expect(service.isSuperadmin()).toBe(true);
        expect(service.organizations()).toEqual(ORGANIZATIONS);
    });

    it('knows no organizations for a superadmin when they cannot be read', () => {
        configure(['superadmin']);

        service.load('/users');
        httpTesting.expectOne(ORGANIZATIONS_URL).flush(null, { status: 500, statusText: 'Server Error' });

        expect(service.organizations()).toEqual([]);
    });

    it.each([
        ['a manager', ['adminuser']],
        ['a normal user', ['editor']]
    ])('asks nothing for %s, who only ever sees the own organization', (_, roles) => {
        configure(roles, 'o2');

        service.load('/users');

        httpTesting.expectNone(ORGANIZATIONS_URL);
        expect(service.isSuperadmin()).toBe(false);
        expect(service.organizations()).toEqual([]);
    });
});
