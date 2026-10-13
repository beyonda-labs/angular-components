import { HttpRequest } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';

import { EditLockService } from './edit-lock.service';
import { EditLock } from './models/edit-lock.model';

const LIFETIME_MS = 120000;
const LOCK_URL = 'https://api.test/api/templates/t1/lock';
const OTHER_LOCK_URL = 'https://api.test/api/templates/t2/lock';
const TICK_MS = LIFETIME_MS / 4;

const OWN: EditLock = {
    acquiredAt: 1000,
    canRelease: true,
    expiresAt: 121000,
    holderId: 'u1',
    holderName: 'Ada Lovelace',
    isOwn: true,
    isSameUser: true
};
const OTHER_WINDOW: EditLock = { ...OWN, isOwn: false };
const COLLEAGUE: EditLock = {
    ...OWN,
    canRelease: false,
    holderId: 'u2',
    holderName: 'Grace Hopper',
    isOwn: false,
    isSameUser: false
};
const RELEASABLE: EditLock = { ...COLLEAGUE, canRelease: true };

describe('EditLockService', () => {
    const originalFetch = globalThis.fetch;
    let fetchSpy: jest.Mock;
    let httpTesting: HttpTestingController;
    let injector: EnvironmentInjector;
    let service: EditLockService;

    function lockRequest(method: string, url = LOCK_URL): TestRequest {
        return httpTesting.expectOne(
            (request: HttpRequest<unknown>) => request.method === method && request.url === url
        );
    }

    function answer(method: string, lock: EditLock | null, lifetimeMs = LIFETIME_MS): HttpRequest<unknown> {
        const request = lockRequest(method);

        request.flush({ lifetimeMs, lock });

        return request.request;
    }

    function fail(method: string, status: number): void {
        lockRequest(method).flush({ errorCode: 'refused' }, { status, statusText: 'Refused' });
    }

    function noContent(request: TestRequest): HttpRequest<unknown> {
        request.flush(null, { status: 204, statusText: 'No Content' });

        return request.request;
    }

    function wait(ticks = 1): void {
        jest.advanceTimersByTime(TICK_MS * ticks);
    }

    beforeEach(() => {
        jest.useFakeTimers();
        fetchSpy = jest.fn().mockResolvedValue(undefined);
        globalThis.fetch = fetchSpy;
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ token: 'session-token' })] });

        httpTesting = TestBed.inject(HttpTestingController);
        injector = createEnvironmentInjector([EditLockService], TestBed.inject(EnvironmentInjector));
        service = injector.get(EditLockService);
    });

    afterEach(() => {
        httpTesting.verify();
        injector.destroy();
        globalThis.fetch = originalFetch;
        jest.useRealTimers();
    });

    it('names its window with a token of its own, sent in the header of a save', () => {
        expect(service.token).toMatch(/^[0-9a-f]{32}$/u);
        expect(service.headers()).toEqual({ 'X-Edit-Lock-Token': service.token });
    });

    it('acquires the lock for the holder and keeps it with a heartbeat every quarter of its lifetime', () => {
        service.start(LOCK_URL);

        expect(service.state().status).toBe('acquiring');
        expect(answer('POST', OWN).body).toEqual({ token: service.token });
        expect(service.state()).toEqual({ lock: OWN, status: 'own' });

        wait();

        expect(answer('POST', OWN).body).toEqual({ token: service.token });
        expect(service.state().status).toBe('own');
    });

    it('follows the lifetime the server answers', () => {
        service.start(LOCK_URL);
        answer('POST', OWN, 60000);

        jest.advanceTimersByTime(15000);

        expect(answer('POST', OWN, 60000).body).toEqual({ token: service.token });
    });

    it('starts each row once, and releases the lock of the previous row when it moves to another', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        service.start(LOCK_URL);
        service.start(OTHER_LOCK_URL);

        expect(noContent(lockRequest('DELETE')).params.get('token')).toBe(service.token);
        expect(lockRequest('POST', OTHER_LOCK_URL).request.body).toEqual({ token: service.token });
    });

    it('waits behind a colleague of the same organization, polling until it is free, without taking it', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);

        expect(service.state()).toEqual({ lock: COLLEAGUE, status: 'held' });

        wait();

        expect(answer('GET', COLLEAGUE).params.get('token')).toBe(service.token);
        expect(service.state().status).toBe('held');

        wait();
        answer('GET', null);

        expect(service.state()).toEqual({ lock: null, status: 'free' });

        wait();
        answer('GET', null);

        expect(service.state().status).toBe('free');
    });

    it('acquires a free lock once it is asked to', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);
        wait();
        answer('GET', null);

        service.acquire();

        expect(service.state().status).toBe('acquiring');
        expect(answer('POST', OWN).body).toEqual({ token: service.token });
        expect(service.state()).toEqual({ lock: OWN, status: 'own' });
    });

    it('lets the same user take the lock over from another window', () => {
        service.start(LOCK_URL);
        answer('POST', OTHER_WINDOW);

        expect(service.state()).toEqual({ lock: OTHER_WINDOW, status: 'held' });

        service.takeOver();

        expect(answer('POST', OWN).body).toEqual({ isTakeOver: true, token: service.token });
        expect(service.state()).toEqual({ lock: OWN, status: 'own' });
    });

    it('loses the lock another window took over, and keeps polling until it is free', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        wait();
        answer('POST', OTHER_WINDOW);

        expect(service.state()).toEqual({ lock: OTHER_WINDOW, status: 'lost' });

        wait();
        answer('GET', OTHER_WINDOW);

        expect(service.state().status).toBe('lost');

        wait();
        answer('GET', null);

        expect(service.state().status).toBe('free');
    });

    it('loses a lock a manager or a superadmin released, and only watches it from then on', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        wait();
        answer('POST', null);

        expect(service.state()).toEqual({ lock: null, status: 'lost' });

        wait();
        answer('GET', null);

        expect(service.state().status).toBe('free');
    });

    it('loses a released lock even when its heartbeat takes it back from scratch, and frees it again', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        wait();
        answer('POST', { ...OWN, acquiredAt: 5000 });

        expect(service.state()).toEqual({ lock: null, status: 'lost' });
        expect(noContent(lockRequest('DELETE')).params.get('token')).toBe(service.token);
    });

    it('releases the lock of a colleague for a manager or a superadmin, without a token', () => {
        service.start(LOCK_URL);
        answer('POST', RELEASABLE);

        service.releaseOther();

        expect(noContent(lockRequest('DELETE')).params.has('token')).toBe(false);
        expect(service.state()).toEqual({ lock: null, status: 'free' });

        wait();
        answer('GET', null);
    });

    it('shows why a release was refused, and keeps waiting behind the lock', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);

        service.releaseOther();
        lockRequest('DELETE').flush(
            { errorCode: 'forbidden', messageKey: 'edit-locks.release-forbidden' },
            { status: 403, statusText: 'Forbidden' }
        );

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.edit-locks.release-forbidden' })
        ]);
        expect(service.state()).toEqual({ lock: COLLEAGUE, status: 'held' });
    });

    it('stops for good for a user who cannot see the row', () => {
        service.start(LOCK_URL);
        fail('POST', 404);

        expect(service.state()).toEqual({ lock: null, status: 'unavailable' });

        service.acquire();
        service.takeOver();
        service.releaseOther();
        wait(4);
    });

    it('stops for good once a poll finds the row gone', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);
        wait();
        fail('GET', 404);

        expect(service.state().status).toBe('unavailable');

        wait(4);
    });

    it('stops for good once the user may no longer edit the row', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        wait();
        fail('POST', 403);

        expect(service.state()).toEqual({ lock: null, status: 'unavailable' });

        wait(4);
    });

    it('stops for good once the row no longer offers the action that edits it', () => {
        service.start(LOCK_URL);
        lockRequest('POST').flush({ errorCode: 'action-unavailable' }, { status: 409, statusText: 'Conflict' });

        expect(service.state()).toEqual({ lock: null, status: 'unavailable' });

        wait(4);
    });

    it('keeps its status through a failed request and tries again on the next tick, with no error modal', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);
        wait();
        lockRequest('POST').error(new ProgressEvent('error'));

        expect(service.state()).toEqual({ lock: OWN, status: 'own' });

        wait();
        fail('POST', 500);

        expect(service.state().status).toBe('own');

        wait();
        answer('POST', OWN);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([]);
    });

    it('sends no new request on a tick while the previous one is on its way', () => {
        service.start(LOCK_URL);

        wait(2);

        answer('POST', OWN);
    });

    it('releases its own lock when asked to, and then watches it', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);

        service.release();

        expect(noContent(lockRequest('DELETE')).params.get('token')).toBe(service.token);
        expect(service.state()).toEqual({ lock: null, status: 'free' });

        wait();
        answer('GET', null);
    });

    it('releases nothing it does not hold', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);

        service.release();

        expect(service.state().status).toBe('held');
    });

    it('releases its lock and stops when its component goes away', () => {
        const owner = createEnvironmentInjector([EditLockService], TestBed.inject(EnvironmentInjector));
        const ownerService = owner.get(EditLockService);
        ownerService.start(LOCK_URL);
        answer('POST', OWN);

        owner.destroy();

        expect(noContent(lockRequest('DELETE')).params.get('token')).toBe(ownerService.token);

        wait(4);
    });

    it('releases its lock on leaving the page with a request that outlives it, carrying the session token', () => {
        service.start(LOCK_URL);
        answer('POST', OWN);

        window.dispatchEvent(new Event('pagehide'));

        expect(fetchSpy).toHaveBeenCalledWith(`${LOCK_URL}?token=${service.token}`, {
            headers: { Authorization: 'Bearer session-token' },
            keepalive: true,
            method: 'DELETE'
        });
        expect(service.state()).toEqual({ lock: null, status: 'free' });

        wait(4);
    });

    it('sends nothing on leaving the page while somebody else holds the lock', () => {
        service.start(LOCK_URL);
        answer('POST', COLLEAGUE);

        window.dispatchEvent(new Event('pagehide'));

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(service.state().status).toBe('held');
    });
});
