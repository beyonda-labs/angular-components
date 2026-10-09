import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
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

    it('reads the roles a user may be given', () => {
        const roles = jest.fn();

        service.loadRoles('/users').subscribe(roles);
        httpTesting.expectOne('https://api.test/api/users/roles').flush({ roles: ['admin', 'editor'] });

        expect(roles).toHaveBeenCalledWith(['admin', 'editor']);
    });

    it('posts to the invitation of a user and confirms it', () => {
        service.resendInvitation('/users', 'u7', 'users.sent').subscribe();
        const request = httpTesting.expectOne('https://api.test/api/users/u7/invitation');
        request.flush(null);

        expect(request.request.method).toBe('POST');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'users.sent' }]);
    });
});
