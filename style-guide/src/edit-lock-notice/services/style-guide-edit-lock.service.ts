import { Injectable, signal } from '@angular/core';
import { BeyEditLock, BeyEditLockService, BeyEditLockState } from '@beyonda-labs/angular-components';

const OWN_LOCK: BeyEditLock = {
    acquiredAt: Date.now(),
    canRelease: true,
    expiresAt: Date.now(),
    holderId: 'u1',
    holderName: 'Ada Lovelace',
    isOwn: true,
    isSameUser: true
};

@Injectable()
export class StyleGuideEditLockService
    implements Pick<BeyEditLockService, 'acquire' | 'releaseOther' | 'state' | 'takeOver'>
{
    private readonly _state = signal<BeyEditLockState>({ lock: OWN_LOCK, status: 'own' });

    readonly state = this._state.asReadonly();

    acquire(): void {
        this._state.set({ lock: OWN_LOCK, status: 'own' });
    }

    releaseOther(): void {
        this._state.set({ lock: null, status: 'free' });
    }

    show(state: BeyEditLockState): void {
        this._state.set(state);
    }

    takeOver(): void {
        this._state.set({ lock: OWN_LOCK, status: 'own' });
    }
}
