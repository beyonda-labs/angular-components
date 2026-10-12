import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { PageHandle } from '../../../page/models/page.model';
import { PageViewMode } from '../../../page/models/page-categories.model';
import { GroupEditFormValue, GroupRow, GroupsConfig } from '../models/groups.model';
import { GroupsActionsService } from './groups-actions.service';

const GROUP_URL = 'https://api.test/api/teams/g1';

describe('GroupsActionsService', () => {
    let httpTesting: HttpTestingController;
    let opened: {
        config: ModalFormConfig<GroupEditFormValue>;
        submit: (value: GroupEditFormValue) => Observable<unknown>;
    }[];
    let page: PageHandle<GroupRow>;

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

    function listField(key: string): FormListField {
        const field = opened[0].config.sections
            .flatMap(section => section.rows.flatMap(row => row.fields))
            .find(current => current.key === key);

        return field as FormListField;
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
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('opens the edit form once the group is read, and saves its name, members and extra roles at once', () => {
        TestBed.inject(GroupsActionsService).edit(
            new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams' }),
            group,
            page
        );

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

    it('searches the users of the organization for the members, asking for 20 more than those chosen', () => {
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group, page);
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
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group, page);
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
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group, page);
        httpTesting
            .expectOne(GROUP_URL)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });

        expect(opened).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.groups.not-found' })
        ]);
    });

    it('does nothing before the page is ready', () => {
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group);

        httpTesting.expectNone(GROUP_URL);
        expect(opened).toEqual([]);
    });
});
