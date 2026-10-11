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

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(GroupsHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the users a group may hold and its members', () => {
        const answers: unknown[] = [];

        service.loadMemberOptions('/teams', 'g1').subscribe(users => answers.push(users));
        service.loadMembers('/teams', 'g1').subscribe(members => answers.push(members));
        httpTesting.expectOne(`${GROUP_URL}/member-options`).flush({ users: [ada] });
        httpTesting.expectOne(`${GROUP_URL}/members`).flush({ members: [] });

        expect(answers).toEqual([[ada], []]);
    });

    it('replaces the members with the users given and confirms it', () => {
        service.setMembers('/teams', 'g1', ['u1'], 'teams.saved').subscribe();
        const request = httpTesting.expectOne(`${GROUP_URL}/members`);
        request.flush({ members: [ada] });

        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ userIds: ['u1'] });
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
            'groups.not-found',
            404,
            'Group not found',
            'This group does not exist or is out of your reach. Reload the page and try again.'
        ]
    ])(
        'shows the reason the server gives for refusing the members, such as %s',
        (messageKey, status, title, message) => {
            const translate = TestBed.inject(TranslateService);
            translate.setTranslation('en', groupsEn);

            service.setMembers('/teams', 'g1', ['u9'], 'teams.saved').subscribe({ error: () => {} });
            httpTesting
                .expectOne(`${GROUP_URL}/members`)
                .flush(
                    { errorCode: 'error', messageKey, messageParameters: { userIds: ['u9'] } },
                    { status, statusText: '' }
                );
            const [error] = TestBed.inject(FakeModalService).errors();

            expect([translate.instant(error.title), translate.instant(error.message)]).toEqual([title, message]);
        }
    );
});
