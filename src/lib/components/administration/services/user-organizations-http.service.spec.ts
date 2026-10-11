import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { UserOrganizationsHttpService } from './user-organizations-http.service';

describe('UserOrganizationsHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: UserOrganizationsHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UserOrganizationsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the organizations a superadmin may invite into, opening no modal when it fails', () => {
        const answers: unknown[] = [];

        service.loadOrganizations('/users').subscribe(organizations => answers.push(organizations));
        httpTesting
            .expectOne('https://api.test/api/users/organizations')
            .flush({ organizations: [{ id: 'o1', name: 'Acme' }] });
        service.loadOrganizations('/users').subscribe({ error: () => answers.push('failed') });
        httpTesting
            .expectOne('https://api.test/api/users/organizations')
            .flush(null, { status: 404, statusText: 'Not Found' });

        expect(answers).toEqual([[{ id: 'o1', name: 'Acme' }], 'failed']);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });
});
