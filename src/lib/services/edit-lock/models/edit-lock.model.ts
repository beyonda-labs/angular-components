export type EditLockStatus = 'acquiring' | 'free' | 'held' | 'lost' | 'own' | 'unavailable';

export interface EditLock {
    acquiredAt: number;
    canRelease: boolean;
    expiresAt: number;
    holderId: string;
    holderName: string | null;
    isOwn: boolean;
    isSameUser: boolean;
}

export interface EditLockResponse {
    lifetimeMs: number;
    lock: EditLock | null;
}

export interface EditLockState {
    lock: EditLock | null;
    status: EditLockStatus;
}

export const DEFAULT_EDIT_LOCK_LIFETIME_MS = 120000;
export const EDIT_LOCK_TOKEN_HEADER = 'X-Edit-Lock-Token';
export const EDIT_LOCK_TOKEN_PARAMETER = 'token';
