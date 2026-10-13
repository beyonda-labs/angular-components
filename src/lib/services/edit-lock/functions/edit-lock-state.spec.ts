import { EditLock, EditLockState } from '../models/edit-lock.model';
import { nextEditLockState } from './edit-lock-state';

describe('nextEditLockState', () => {
    const own: EditLock = {
        acquiredAt: 1000,
        canRelease: true,
        expiresAt: 121000,
        holderId: 'u1',
        holderName: 'Ada Lovelace',
        isOwn: true,
        isSameUser: true
    };
    const otherWindow: EditLock = { ...own, isOwn: false };
    const colleague: EditLock = {
        ...own,
        canRelease: false,
        holderId: 'u2',
        holderName: 'Grace Hopper',
        isOwn: false,
        isSameUser: false
    };

    function state(status: EditLockState['status'], lock: EditLock | null = null): EditLockState {
        return { lock, status };
    }

    it('holds a lock answered as its own', () => {
        expect(nextEditLockState(state('acquiring'), own)).toEqual(state('own', own));
        expect(nextEditLockState(state('own', own), { ...own, expiresAt: 151000 })).toEqual(
            state('own', { ...own, expiresAt: 151000 })
        );
    });

    it('waits behind a lock somebody else holds, a colleague or another window of the same user', () => {
        expect(nextEditLockState(state('acquiring'), colleague)).toEqual(state('held', colleague));
        expect(nextEditLockState(state('free'), otherWindow)).toEqual(state('held', otherWindow));
    });

    it('loses a held lock that somebody else holds now, and stays lost while they do', () => {
        expect(nextEditLockState(state('own', own), otherWindow)).toEqual(state('lost', otherWindow));
        expect(nextEditLockState(state('lost', otherWindow), colleague)).toEqual(state('lost', colleague));
    });

    it('loses a held lock that was released, even when the answer took it back from scratch', () => {
        expect(nextEditLockState(state('own', own), null)).toEqual(state('lost'));
        expect(nextEditLockState(state('own', own), { ...own, acquiredAt: 5000 })).toEqual(state('lost'));
    });

    it('finds the lock free once nobody holds it, after waiting or after losing it', () => {
        expect(nextEditLockState(state('held', colleague), null)).toEqual(state('free'));
        expect(nextEditLockState(state('lost', colleague), null)).toEqual(state('free'));
    });
});
