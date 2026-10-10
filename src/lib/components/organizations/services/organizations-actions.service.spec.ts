import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { PageHandle } from '../../page/models/page.model';
import { PageViewMode } from '../../page/models/page-categories.model';
import {
    OrganizationAdminFormValue,
    OrganizationRow,
    OrganizationsConfig,
    OrganizationStatus
} from '../models/organizations.model';
import { OrganizationsActionsService } from './organizations-actions.service';

describe('OrganizationsActionsService', () => {
    let opened: {
        config: ModalFormConfig<OrganizationAdminFormValue>;
        submit: (value: unknown) => Observable<unknown>;
    }[];
    let page: PageHandle<OrganizationRow>;

    const organization: OrganizationRow = {
        actions: ['invite-admin'],
        createdAt: 0,
        id: 'o2',
        name: 'Globex',
        status: OrganizationStatus.Active,
        userCount: 0
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        opened = [];
        page = {
            openCategory: jest.fn(),
            openEdit: jest.fn(),
            openForm: (config, submit) =>
                opened.push({
                    config: config as unknown as ModalFormConfig<OrganizationAdminFormValue>,
                    submit: submit as (value: unknown) => Observable<unknown>
                }),
            refresh: jest.fn(),
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
    });

    it('opens the invitation form of the admin on the page, and sends it with the organization and the admin role', () => {
        const httpTesting = TestBed.inject(HttpTestingController);

        TestBed.inject(OrganizationsActionsService).inviteAdmin(
            new OrganizationsConfig({ adminRole: 'owner', prefix: 'demo.tenants', usersUrl: '/staff' }),
            organization,
            page
        );
        opened[0]
            .submit({ main: { email: ' ada@example.test ', language: '', name: ' Ada ', surname: 'Lovelace' } })
            .subscribe();
        const request = httpTesting.expectOne('https://api.test/api/staff');
        request.flush({ id: 'u1' });

        expect(opened[0].config.prefix).toBe('demo.tenants.invite-admin');
        expect(request.request.body).toEqual({
            email: 'ada@example.test',
            name: 'Ada',
            organizationId: 'o2',
            roles: ['owner'],
            surname: 'Lovelace'
        });
        httpTesting.verify();
    });

    it('does nothing before the page is ready', () => {
        TestBed.inject(OrganizationsActionsService).inviteAdmin(new OrganizationsConfig(), organization);

        expect(opened).toEqual([]);
    });
});
