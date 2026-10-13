import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { UsersHttpService } from './users-http.service';

describe('UsersHttpService', () => {
    let httpTesting: HttpTestingController;
    let service: UsersHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        httpTesting = TestBed.inject(HttpTestingController);
        service = TestBed.inject(UsersHttpService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('reads the roles and the extra roles a user may be given, with no extra roles from a server without them', () => {
        const answers: unknown[] = [];
        const reviewers = { id: 'r1', name: 'Reviewers', organizationId: 'o1' };

        service.loadRoles('/users').subscribe(roles => answers.push(roles));
        httpTesting
            .expectOne('https://api.test/api/users/roles')
            .flush({ extraRoles: [reviewers], roles: ['admin', 'editor'] });
        service.loadRoles('/users').subscribe(roles => answers.push(roles));
        httpTesting.expectOne('https://api.test/api/users/roles').flush({ roles: ['editor'] });

        expect(answers).toEqual([
            { extraRoles: [reviewers], roles: ['admin', 'editor'] },
            { extraRoles: [], roles: ['editor'] }
        ]);
    });

    it('posts to the invitation of a user and confirms it', () => {
        service.resendInvitation('/users', 'u7', 'users.sent').subscribe();
        const request = httpTesting.expectOne('https://api.test/api/users/u7/invitation');
        request.flush(null);

        expect(request.request.method).toBe('POST');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'users.sent' }]);
    });

    it('reads what a user owns and what others use of it, nothing of either from an answer without them', () => {
        const answers: unknown[] = [];

        service.loadContent('/users', 'u7').subscribe(content => answers.push(content));
        httpTesting
            .expectOne('https://api.test/api/users/u7/content')
            .flush({ counts: { documents: 2 }, usedByOthers: { documents: [] } });
        service.loadContent('/users', 'u7').subscribe(content => answers.push(content));
        httpTesting.expectOne('https://api.test/api/users/u7/content').flush({});

        expect(answers).toEqual([
            { counts: { documents: 2 }, usedByOthers: { documents: [] } },
            { counts: {}, usedByOthers: {} }
        ]);
    });

    it('searches the users who may receive the content of another by the text typed, at most as many as asked', () => {
        const answers: unknown[] = [];
        const grace = { email: 'grace@example.test', id: 'u2', name: 'Grace', surname: 'Hopper' };

        service.searchTransferTargets('/users', 'u7', 'gra', 20).subscribe(targets => answers.push(targets));
        const request = httpTesting.expectOne(
            current => current.url === 'https://api.test/api/users/u7/transfer-targets'
        );
        request.flush({ options: [grace] });

        expect([request.request.params.get('search'), request.request.params.get('limit')]).toEqual(['gra', '20']);
        expect(answers).toEqual([[grace]]);
    });

    it('transfers the content of a user to the one chosen and confirms it', () => {
        service.transfer('/users', 'u7', 'u2', 'users.transferred').subscribe();
        const request = httpTesting.expectOne('https://api.test/api/users/u7/transfer');
        request.flush({ transferred: { documents: 2 } });

        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ targetUserId: 'u2' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'users.transferred' }]);
    });

    it('deletes the users one after the other, confirming once the last is gone', () => {
        const done = jest.fn();

        service.deleteUsers('/users', ['u7', 'u8'], 'users.deleted').subscribe(done);
        const first = httpTesting.expectOne('https://api.test/api/users/u7');
        httpTesting.expectNone('https://api.test/api/users/u8');
        first.flush(null, { status: 204, statusText: 'No Content' });
        const second = httpTesting.expectOne('https://api.test/api/users/u8');

        expect(TestBed.inject(FakeToastService).successes()).toEqual([]);

        second.flush(null, { status: 204, statusText: 'No Content' });

        expect([first.request.method, second.request.method]).toEqual(['DELETE', 'DELETE']);
        expect(done).toHaveBeenCalledTimes(1);
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: 'users.deleted' }]);
    });
});
