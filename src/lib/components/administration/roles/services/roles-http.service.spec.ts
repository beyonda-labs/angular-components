import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { RolesHttpService } from './roles-http.service';

const PERMISSIONS_URL = 'https://api.test/api/staff-roles/permissions';

describe('RolesHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: RolesHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(RolesHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the permissions the caller may put in a role', () => {
        const answers: unknown[] = [];

        service.loadPermissions('/staff-roles').subscribe(permissions => answers.push(permissions));
        httpTesting.expectOne(PERMISSIONS_URL).flush({ permissions: [{ group: 'templates', key: 'templates.edit' }] });

        expect(answers).toEqual([[{ group: 'templates', key: 'templates.edit' }]]);
    });

    it('opens no modal when the permissions cannot be read', () => {
        const answers: unknown[] = [];

        service.loadPermissions('/staff-roles').subscribe({ error: () => answers.push('failed') });
        httpTesting.expectOne(PERMISSIONS_URL).flush(null, { status: 404, statusText: 'Not Found' });

        expect(answers).toEqual(['failed']);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });
});
