import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { UsersHttpService } from './users-http.service';

describe('UsersHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: UsersHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UsersHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the roles and the extra roles a user may be given, with no extra roles from a server without them', () => {
        const answers: unknown[] = [];
        const reviewers = { id: 'r1', name: 'Reviewers', organizationId: 'o1' };

        service.loadRoles('/users').subscribe(roles => answers.push(roles));
        httpTesting
            .expectOne('https://api.test/api/users/roles')
            .flush({ extraRoles: [reviewers], roles: ['admin', 'editor'] });
        service.loadRoles('/users').subscribe(roles => answers.push(roles));
        httpTesting.expectOne('https://api.test/api/users/roles').flush({ roles: ['editor'] });

        expect(answers).toEqual([
            { extraRoles: [reviewers], roles: ['admin', 'editor'] },
            { extraRoles: [], roles: ['editor'] }
        ]);
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

    it('posts to the invitation of a user and confirms it', () => {
        service.resendInvitation('/users', 'u7', 'users.sent').subscribe();
        const request = httpTesting.expectOne('https://api.test/api/users/u7/invitation');
        request.flush(null);

        expect(request.request.method).toBe('POST');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'users.sent' }]);
    });
});
