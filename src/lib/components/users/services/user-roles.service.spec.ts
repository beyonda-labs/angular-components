import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { UserRolesService } from './user-roles.service';

describe('UserRolesService', () => {
    let httpTesting: HttpTestingController;
    let service: UserRolesService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [UserRolesService, provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UserRolesService);
    });

    it('knows no roles until they are read', () => {
        expect(service.roles()).toBeNull();

        service.load('/users');
        httpTesting.expectOne('https://api.test/api/users/roles').flush({ roles: ['editor'] });

        expect(service.roles()).toEqual(['editor']);
    });

    it('knows the roles to be none when they cannot be read', () => {
        service.load('/users');
        httpTesting.expectOne('https://api.test/api/users/roles').flush(null, { status: 403, statusText: 'Forbidden' });

        expect(service.roles()).toEqual([]);
    });
});
