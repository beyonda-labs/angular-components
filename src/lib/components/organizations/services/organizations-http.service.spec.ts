import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import organizationsEn from '../assets/organizations.en.json';
import { OrganizationsHttpService } from './organizations-http.service';

describe('OrganizationsHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: OrganizationsHttpService;

    const invitation = { email: 'grace@example.test', organizationId: 'o2', roles: ['adminuser'] };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(OrganizationsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('posts the invitation of the admin to the users and confirms it', () => {
        service.inviteAdmin('/users', invitation, 'tenants.invited').subscribe();
        const request = httpTesting.expectOne('https://api.test/api/users');
        request.flush({ id: 'u9' });

        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(invitation);
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'tenants.invited' }]);
    });

    it('shows the reason the server gives for refusing it, such as a deactivated organization', () => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', organizationsEn);

        service.inviteAdmin('/users', invitation, 'tenants.invited').subscribe({ error: () => {} });
        httpTesting
            .expectOne('https://api.test/api/users')
            .flush(
                { errorCode: 'not-found', messageKey: 'organizations.not-found' },
                { status: 404, statusText: 'Not Found' }
            );
        const [error] = TestBed.inject(FakeModalService).errors();

        expect([translate.instant(error.title), translate.instant(error.message)]).toEqual([
            'Organization not found',
            'This organization does not exist or has been deactivated. Reload the page and try again.'
        ]);
    });
});
