import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageViewMode } from '../../../page/models/page-categories.model';
import {
    OrganizationEditFormValue,
    OrganizationRow,
    OrganizationsConfig,
    OrganizationStatus
} from '../models/organizations.model';
import { OrganizationsActionsService } from './organizations-actions.service';

const ORGANIZATION_URL = 'https://api.test/api/tenants/o2';

describe('OrganizationsActionsService', () => {
    let httpTesting: HttpTestingController;
    let opened: {
        config: ModalFormConfig<OrganizationEditFormValue>;
        submit: (value: OrganizationEditFormValue) => Observable<unknown>;
    }[];
    let page: PageHandle<OrganizationRow>;

    const organization: OrganizationRow = {
        actions: ['edit'],
        createdAt: 0,
        id: 'o2',
        name: 'Globex',
        status: OrganizationStatus.Active,
        userCount: 0
    };

    function edit(): void {
        TestBed.inject(OrganizationsActionsService).edit(
            new OrganizationsConfig({ baseUrl: '/tenants', prefix: 'demo.tenants' }),
            organization,
            page
        );
        httpTesting
            .expectOne(ORGANIZATION_URL)
            .flush({ ...organization, administrators: [], groups: [], ungroupedMembers: [] });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        opened = [];
        page = {
            openCategory: jest.fn(),
            openEdit: jest.fn(),
            openForm: (config, submit) =>
                opened.push({
                    config: config as unknown as ModalFormConfig<OrganizationEditFormValue>,
                    submit: submit as unknown as (value: OrganizationEditFormValue) => Observable<unknown>
                }),
            refresh: jest.fn(),
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('opens the edit form once the organization is read, and saves the name and the status changed', () => {
        edit();
        opened[0].submit({ main: { name: ' Globex Corp ', status: OrganizationStatus.Inactive } }).subscribe();
        const request = httpTesting.expectOne(ORGANIZATION_URL);
        request.flush({ ...organization, status: OrganizationStatus.Inactive });

        expect(opened[0].config.title).toBe('demo.tenants.form.edit.title');
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Globex Corp', status: 'inactive' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'demo.tenants.toast.edit-success' }]);
    });

    it('sends no status while it stays as it was', () => {
        edit();
        opened[0].submit({ main: { name: 'Globex', status: OrganizationStatus.Active } }).subscribe();
        const request = httpTesting.expectOne(ORGANIZATION_URL);
        request.flush(organization);

        expect(request.request.body).toEqual({ name: 'Globex' });
    });

    it('does nothing before the page is ready', () => {
        TestBed.inject(OrganizationsActionsService).edit(new OrganizationsConfig(), organization);

        httpTesting.expectNone(() => true);
        expect(opened).toEqual([]);
    });
});
