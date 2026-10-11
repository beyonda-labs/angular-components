import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import groupsEn from '../assets/groups.en.json';
import { GroupsHttpService } from './groups-http.service';

const GROUP_URL = 'https://api.test/api/teams/g1';

describe('GroupsHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: GroupsHttpService;

    const ada = { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' };
    const reviewers = { id: 'r1', name: 'Reviewers' };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(GroupsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads a group with its members and extra roles, the users it may hold and the extra roles it may hold', () => {
        const answers: unknown[] = [];
        const detail = {
            actions: [],
            createdAt: 0,
            extraRoles: [reviewers],
            id: 'g1',
            memberCount: 1,
            members: [ada],
            name: 'Sales'
        };

        service.loadGroup('/teams', 'g1').subscribe(group => answers.push(group));
        service.loadMemberOptions('/teams', 'g1').subscribe(users => answers.push(users));
        service.loadRoleOptions('/teams', 'g1').subscribe(roles => answers.push(roles));
        httpTesting.expectOne(GROUP_URL).flush(detail);
        httpTesting.expectOne(`${GROUP_URL}/member-options`).flush({ users: [ada] });
        httpTesting.expectOne(`${GROUP_URL}/role-options`).flush({ extraRoles: [reviewers] });

        expect(answers).toEqual([detail, [ada], [reviewers]]);
    });

    it('saves the name, the members and the extra roles of a group at once and confirms it', () => {
        service
            .edit('/teams', 'g1', { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] }, 'teams.saved')
            .subscribe();
        const request = httpTesting.expectOne(GROUP_URL);
        request.flush({ actions: [], createdAt: 0, id: 'g1', memberCount: 1, name: 'Sales' });

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'teams.saved' }]);
    });

    it.each([
        [
            'groups.invalid-members',
            400,
            'Members not valid',
            'Some of the people chosen cannot join this group: they belong to another organization or no longer exist. Reload the page and try again.'
        ],
        [
            'groups.invalid-extra-roles',
            400,
            'Additional roles not valid',
            'Some of the additional roles chosen do not belong to the organization of the group or no longer exist. Reload the page and try again.'
        ],
        [
            'groups.not-found',
            404,
            'Group not found',
            'This group does not exist or is out of your reach. Reload the page and try again.'
        ]
    ])('shows the reason the server gives for refusing an edit, such as %s', (messageKey, status, title, message) => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', groupsEn);

        service.edit('/teams', 'g1', { name: 'Sales', userIds: ['u9'] }, 'teams.saved').subscribe({ error: () => {} });
        httpTesting
            .expectOne(GROUP_URL)
            .flush(
                { errorCode: 'error', messageKey, messageParameters: { userIds: ['u9'] } },
                { status, statusText: '' }
            );
        const [error] = TestBed.inject(FakeModalService).errors();

        expect([translate.instant(error.title), translate.instant(error.message)]).toEqual([title, message]);
    });
});
