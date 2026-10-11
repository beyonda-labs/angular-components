import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { RolePermissionsService } from './role-permissions.service';

describe('RolePermissionsService', () => {
    let httpTesting: HttpTestingController;
    let service: RolePermissionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [RolePermissionsService, provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(RolePermissionsService);
    });

    it('knows no permissions until they are read', () => {
        expect(service.permissions()).toBeNull();

        service.load('/roles');
        httpTesting
            .expectOne('https://api.test/api/roles/permissions')
            .flush({ permissions: [{ group: 'templates', key: 'templates.edit' }] });

        expect(service.permissions()).toEqual([{ group: 'templates', key: 'templates.edit' }]);
    });

    it('knows the permissions to be none when they cannot be read', () => {
        service.load('/roles');
        httpTesting
            .expectOne('https://api.test/api/roles/permissions')
            .flush(null, { status: 404, statusText: 'Not Found' });

        expect(service.permissions()).toEqual([]);
    });
});
