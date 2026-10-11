import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
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
        httpTesting.expectOne(`${GROUP_URL}/member-options`).flush({ users: [ada, grace] });
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

    it('opens the edit form once the group, its member options and its role options are read, and saves them at once', () => {
        TestBed.inject(GroupsActionsService).edit(
            new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams' }),
            group,
            page
        );
        answerGroup();

        expect(opened).toEqual([]);

        httpTesting.expectOne(`${GROUP_URL}/role-options`).flush({ extraRoles: [reviewers] });
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

    it('sends no extra roles when the organization of the group has none to offer', () => {
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group, page);
        answerGroup();
        httpTesting.expectOne(`${GROUP_URL}/role-options`).flush({ extraRoles: [] });

        opened[0].submit({ main: { name: 'Sales', userIds: ['u1'] } }).subscribe();
        const request = httpTesting.expectOne(GROUP_URL);
        request.flush(group);

        expect(request.request.body).toEqual({ name: 'Sales', userIds: ['u1'] });
    });

    it('opens nothing and shows the reason once when the group cannot be read', () => {
        TestBed.inject(GroupsActionsService).edit(new GroupsConfig({ baseUrl: '/teams' }), group, page);
        httpTesting
            .expectOne(GROUP_URL)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });

        expect(httpTesting.expectOne(`${GROUP_URL}/member-options`).cancelled).toBe(true);
        expect(httpTesting.expectOne(`${GROUP_URL}/role-options`).cancelled).toBe(true);
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
