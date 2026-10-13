import { EditLock, EditLockState } from '../models/edit-lock.model';

export function nextEditLockState(current: EditLockState, lock: EditLock | null): EditLockState {
    const wasOwn = current.status === 'own';

    if (!lock) {
        return { lock: null, status: wasOwn ? 'lost' : 'free' };
    }

    if (!lock.isOwn) {
        return { lock, status: wasOwn || current.status === 'lost' ? 'lost' : 'held' };
    }

    return wasOwn && current.lock && current.lock.acquiredAt !== lock.acquiredAt
        ? { lock: null, status: 'lost' }
        : { lock, status: 'own' };
}
