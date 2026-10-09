import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { UsersConfig, UserStatus } from '../models/users.model';
import { UsersActionsService } from './users-actions.service';

describe('UsersActionsService', () => {
    it('sends the invitation of a user again under the address of the config, with its toast', () => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
        const httpTesting = TestBed.inject(HttpTestingController);

        TestBed.inject(UsersActionsService).resendInvitation(new UsersConfig({ baseUrl: '/staff', prefix: 'demo' }), {
            actions: ['resend-invitation'],
            createdAt: 0,
            email: 'ada@example.test',
            id: 'u1',
            roles: [],
            status: UserStatus.Invited
        });
        httpTesting.expectOne('https://api.test/api/staff/u1/invitation').flush(null);

        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'demo.toast.resend-invitation-success' }
        ]);
        httpTesting.verify();
    });
});
