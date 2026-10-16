import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormCheckboxSectionsField } from '../../../form/models/fields/form-checkbox-sections-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormField } from '../../../form/models/form-field.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageViewMode } from '../../../page/models/page-categories.model';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { RolesConfig } from '../../roles/models/roles.model';
import { GroupEditFormValue, GroupRow, GroupsConfig } from '../models/groups.model';
import { GroupsActionsService } from './groups-actions.service';

const CONFIG = new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams' });
const GROUP_URL = 'https://api.test/api/teams/g1';

describe('GroupsActionsService', () => {
    let httpTesting: HttpTestingController;
    let opened: {
        config: ModalFormConfig<GroupEditFormValue>;
        submit: (value: GroupEditFormValue) => Observable<unknown>;
    }[];
    let page: PageHandle<GroupRow, OrganizationFolder>;
    let service: GroupsActionsService;

    const ada = { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' };
    const grace = { email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' };
    const reviewers = { id: 'r1', name: 'Reviewers' };
    const group: GroupRow = {
        actions: ['edit'],
        createdAt: 0,
        extraRoleCount: 1,
        id: 'g1',
        memberCount: 1,
        name: 'Sales'
    };

    function answerGroup(): void {
        httpTesting.expectOne(GROUP_URL).flush({ ...group, extraRoles: [reviewers], members: [ada] });
    }

    function edit(isOrganizationShown = false): void {
        service.edit(CONFIG, group, isOrganizationShown, page);
    }

    function fieldOf(key: string): FormField | undefined {
        return fieldsOf(opened[0].config).find(current => current.key === key);
    }

    function listField(key: string): FormListField {
        return fieldOf(key) as FormListField;
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
                    config: config as unknown as ModalFormConfig<GroupEditFormValue>,
                    submit: submit as unknown as (value: GroupEditFormValue) => Observable<unknown>
                }),
            refresh: jest.fn(),
            search: () => ({ filters: [], page: 1, size: 10 }),
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
        service = TestBed.inject(GroupsActionsService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('opens the edit form once the group is read, and saves its name, members and extra roles at once', () => {
        edit();

        expect(opened).toEqual([]);

        answerGroup();
        opened[0].submit({ main: { extraRoleIds: [], name: ' Sales team ', userIds: ['u1', 'u2'] } }).subscribe();
        const request = httpTesting.expectOne(GROUP_URL);
        request.flush({ ...group, memberCount: 2 });

        expect(opened[0].config.initialValue).toEqual({
            main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] }
        });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ extraRoleIds: [], name: 'Sales team', userIds: ['u1', 'u2'] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'demo.teams.toast.edit-success' }]);
    });

    it('shows a superadmin the organization of the group, disabled, and never sends it', () => {
        edit(true);
        httpTesting.expectOne(GROUP_URL).flush({
            ...group,
            extraRoles: [],
            members: [],
            organizationId: 'o2',
            organizationName: 'Globex'
        });
        opened[0].submit({ main: { extraRoleIds: [], name: 'Sales', organizationId: 'o2', userIds: [] } }).subscribe();
        const request = httpTesting.expectOne(GROUP_URL);
        request.flush(group);

        expect(opened[0].config.initialValue?.main.organizationId).toBe('o2');
        expect(fieldOf('organizationId')).toMatchObject({ isDisabled: true });
        expect(request.request.body).toEqual({ extraRoleIds: [], name: 'Sales', userIds: [] });
    });

    it('searches the users of the organization for the members, asking for 20 more than those chosen', () => {
        edit();
        answerGroup();
        const answers: unknown[] = [];

        listField('userIds')
            .picker?.search?.('gra', ['u1'])
            .subscribe(answer => answers.push(answer));
        const request = httpTesting.expectOne(current => current.url === `${GROUP_URL}/member-options`);
        request.flush({ users: [ada, grace] });

        expect(request.request.urlWithParams).toBe(`${GROUP_URL}/member-options?search=gra&limit=21`);
        expect(answers).toEqual([
            { hasMore: false, options: [{ label: 'Grace Hopper (grace@example.test)', value: 'u2' }] }
        ]);
    });

    it('searches the extra roles of the organization by name, and leaves out those chosen', () => {
        const writers = { id: 'r2', name: 'Writers' };
        edit();
        answerGroup();
        const answers: unknown[] = [];

        listField('extraRoleIds')
            .picker?.search?.('er', ['r1'])
            .subscribe(answer => answers.push(answer));
        const request = httpTesting.expectOne(current => current.url === `${GROUP_URL}/role-options`);
        request.flush({ extraRoles: [reviewers, writers] });

        expect(request.request.urlWithParams).toBe(`${GROUP_URL}/role-options?search=er&limit=21`);
        expect(answers).toEqual([{ hasMore: false, options: [{ label: 'Writers', value: 'r2' }] }]);
    });

    it('opens nothing and shows the reason once when the group cannot be read', () => {
        edit();
        httpTesting
            .expectOne(GROUP_URL)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });

        expect(opened).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.groups.not-found' })
        ]);
    });

    it('does nothing before the page is ready', () => {
        service.edit(CONFIG, group, false);

        httpTesting.expectNone(GROUP_URL);
        expect(opened).toEqual([]);
    });

    it('shows a group to a member and the permissions of its roles in the view of the roles page', () => {
        const modalForms = TestBed.inject(FakeModalFormService);
        const rolesConfig = new RolesConfig({
            groupIcons: { templates: faFileLines },
            permissionPrefix: 'my-app.permissions'
        });

        service.view(new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams', rolesConfig }), {
            ...group,
            actions: []
        });
        httpTesting.expectOne(GROUP_URL).flush({
            extraRoles: [{ description: 'Review', id: 'r1', name: 'Reviewers', permissions: ['templates.edit'] }],
            id: 'g1',
            members: [ada],
            name: 'Sales'
        });
        const [view] = modalForms.forms();
        const roles = fieldsOf(view).at(-1) as FormListField;
        roles.onItemClick?.('Reviewers', 0);
        const permissions = modalForms.forms()[1];
        const checklist = fieldsOf(permissions).find(({ key }) => key === 'permissions') as FormCheckboxSectionsField;

        expect(view.title).toBe('demo.teams.view.title');
        expect(permissions.title).toBe('angular-components.roles.view.title');
        expect(checklist.isDisabled).toBe(true);
        expect(
            checklist.sections.map(({ icon, key, options }) => [key, icon, options.map(({ value }) => value)])
        ).toEqual([['templates', faFileLines, ['templates.edit']]]);
    });
});
