import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageViewMode } from '../../../page/models/page-categories.model';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { RoleFormValue, RoleRow, RolesDuplicateOptions } from '../models/roles.model';
import { RolesActionsService } from './roles-actions.service';

const ROLES_URL = 'https://api.test/api/staff-roles';

describe('RolesActionsService', () => {
    let httpTesting: HttpTestingController;
    let opened: {
        config: ModalFormConfig<RoleFormValue>;
        submit: (value: RoleFormValue) => Observable<unknown>;
    }[];
    let page: PageHandle<RoleRow, OrganizationFolder>;

    const normaluser: RoleRow = {
        actions: [],
        id: 'normaluser',
        isBase: true,
        memberCount: 3,
        name: 'normaluser',
        permissions: ['documents.read']
    };
    const reviewers: RoleRow = {
        actions: ['duplicate'],
        description: 'Review the templates',
        id: 'r1',
        isBase: false,
        memberCount: 2,
        name: 'Reviewers',
        permissions: ['templates.edit']
    };

    function buildDuplicateOptions(): RolesDuplicateOptions {
        return {
            actionOrder: [],
            baseUrl: '/staff-roles',
            groupIcons: {},
            groupOrder: [],
            isOrganizationAsked: false,
            organizations: [],
            permissionPrefix: 'demo.permissions',
            permissions: [{ group: 'templates', key: 'templates.edit' }],
            prefix: 'demo.roles',
            rolePrefix: 'demo.roles'
        };
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        opened = [];
        page = {
            openCategory: jest.fn(),
            openEdit: jest.fn(),
            openForm: (config, submit) =>
                opened.push({
                    config: config as unknown as ModalFormConfig<RoleFormValue>,
                    submit: submit as unknown as (value: RoleFormValue) => Observable<unknown>
                }),
            refresh: jest.fn(),
            search: () => ({ filters: [], page: 1, size: 10 }),
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('opens the permissions of a role in a form that only shows them', () => {
        TestBed.inject(RolesActionsService).viewPermissions(
            {
                actionOrder: [],
                groupIcons: {},
                groupOrder: [],
                permissionPrefix: 'demo.permissions',
                permissions: [{ group: 'documents', key: 'documents.read' }],
                prefix: 'demo.roles',
                rolePrefix: 'demo.roles'
            },
            normaluser
        );
        const [form] = TestBed.inject(FakeModalFormService).forms();

        expect(form.title).toBe('demo.roles.view.title');
        expect(form.isSubmitHidden).toBe(true);
        expect(form.initialValue).toEqual(
            expect.objectContaining({ permissions: { permissions: ['documents.read'] } })
        );
    });

    it('duplicates a role through the create request, from a form on the page filled in with the role', () => {
        TestBed.inject(RolesActionsService).duplicate(buildDuplicateOptions(), reviewers, page);
        opened[0]
            .submit({
                main: { description: ' Review ', name: ' Reviewers (copy) ' },
                permissions: { permissions: ['templates.edit'] }
            })
            .subscribe();
        const request = httpTesting.expectOne(ROLES_URL);
        request.flush({ ...reviewers, id: 'r2', name: 'Reviewers (copy)' });

        expect(opened[0].config.title).toBe('demo.roles.duplicate.title');
        expect(opened[0].config.initialValue?.main).toEqual(
            expect.objectContaining({ description: 'Review the templates' })
        );
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            description: 'Review',
            name: 'Reviewers (copy)',
            permissions: ['templates.edit']
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'demo.roles.toast.duplicate-success' }
        ]);
    });

    it('does nothing before the page is ready', () => {
        TestBed.inject(RolesActionsService).duplicate(buildDuplicateOptions(), reviewers);

        expect(opened).toEqual([]);
        expect(TestBed.inject(FakeModalFormService).forms()).toEqual([]);
    });
});
