import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import organizationsEn from '../assets/organizations.en.json';
import { OrganizationStatus } from '../models/organizations.model';
import { OrganizationsHttpService } from './organizations-http.service';

const ORGANIZATION_URL = 'https://api.test/api/tenants/o2';

describe('OrganizationsHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: OrganizationsHttpService;

    const row = {
        actions: ['edit'],
        createdAt: 0,
        id: 'o2',
        name: 'Globex',
        status: OrganizationStatus.Active,
        userCount: 1
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(OrganizationsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads an organization with its groups and their members', () => {
        const detail = { ...row, groups: [{ id: 'g1', members: [], name: 'Sales' }] };
        const answers: unknown[] = [];

        service.loadOrganization('/tenants', 'o2').subscribe(answer => answers.push(answer));
        httpTesting.expectOne(ORGANIZATION_URL).flush(detail);

        expect(answers).toEqual([detail]);
    });

    it('saves the name and the status of an organization and confirms it', () => {
        service
            .edit('/tenants', 'o2', { name: 'Globex', status: OrganizationStatus.Inactive }, 'tenants.saved')
            .subscribe();
        const request = httpTesting.expectOne(ORGANIZATION_URL);
        request.flush({ ...row, status: OrganizationStatus.Inactive });

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Globex', status: 'inactive' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'tenants.saved' }]);
    });

    it('shows the reason the server gives for refusing an edit, such as a name taken', () => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', organizationsEn);

        service.edit('/tenants', 'o2', { name: 'Acme' }, 'tenants.saved').subscribe({ error: () => {} });
        httpTesting.expectOne(ORGANIZATION_URL).flush(
            {
                errorCode: 'conflict',
                messageKey: 'organizations.existing-name',
                messageParameters: { name: 'Acme' }
            },
            { status: 409, statusText: 'Conflict' }
        );
        const [error] = TestBed.inject(FakeModalService).errors();

        expect([
            translate.instant(error.title),
            translate.instant(error.message, error.messageParameters as Record<string, unknown>)
        ]).toEqual(['Name already in use', 'There is already an organization named Acme.']);
    });
});
