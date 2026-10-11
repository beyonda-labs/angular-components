import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { Observable } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { PageHandle } from '../../page/models/page.model';
import { PageViewMode } from '../../page/models/page-categories.model';
import { GroupMembersFormValue, GroupRow, GroupsConfig } from '../models/groups.model';
import { GroupsActionsService } from './groups-actions.service';

const GROUP_URL = 'https://api.test/api/teams/g1';

describe('GroupsActionsService', () => {
    let httpTesting: HttpTestingController;
    let opened: {
        config: ModalFormConfig<GroupMembersFormValue>;
        submit: (value: GroupMembersFormValue) => Observable<unknown>;
    }[];
    let page: PageHandle<GroupRow>;

    const ada = { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' };
    const grace = { email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' };
    const group: GroupRow = { actions: ['members'], createdAt: 0, id: 'g1', memberCount: 1, name: 'Sales' };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        opened = [];
        page = {
            openCategory: jest.fn(),
            openEdit: jest.fn(),
            openForm: (config, submit) =>
                opened.push({
                    config: config as unknown as ModalFormConfig<GroupMembersFormValue>,
                    submit: submit as unknown as (value: GroupMembersFormValue) => Observable<unknown>
                }),
            refresh: jest.fn(),
            selected: () => [],
            viewMode: () => PageViewMode.Table
        };
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('opens the members form once the options and the members are read, and replaces the members on save', () => {
        TestBed.inject(GroupsActionsService).editMembers(
            new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams' }),
            group,
            page
        );
        httpTesting.expectOne(`${GROUP_URL}/member-options`).flush({ users: [ada, grace] });

        expect(opened).toEqual([]);

        httpTesting.expectOne(`${GROUP_URL}/members`).flush({ members: [ada] });
        opened[0].submit({ main: { userIds: ['u1', 'u2'] } }).subscribe();
        const request = httpTesting.expectOne(`${GROUP_URL}/members`);
        request.flush({ members: [ada, grace] });

        expect(opened[0].config.prefix).toBe('demo.teams.members');
        expect(opened[0].config.initialValue).toEqual({ main: { userIds: ['u1'] } });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ userIds: ['u1', 'u2'] });
    });

    it('opens nothing and shows the reason once when the group cannot be read', () => {
        TestBed.inject(GroupsActionsService).editMembers(new GroupsConfig({ baseUrl: '/teams' }), group, page);
        httpTesting
            .expectOne(`${GROUP_URL}/member-options`)
            .flush({ errorCode: 'not-found', messageKey: 'groups.not-found' }, { status: 404, statusText: '' });

        expect(httpTesting.expectOne(`${GROUP_URL}/members`).cancelled).toBe(true);
        expect(opened).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.groups.not-found' })
        ]);
    });

    it('does nothing before the page is ready', () => {
        TestBed.inject(GroupsActionsService).editMembers(new GroupsConfig({ baseUrl: '/teams' }), group);

        httpTesting.expectNone(`${GROUP_URL}/member-options`);
        expect(opened).toEqual([]);
    });
});
