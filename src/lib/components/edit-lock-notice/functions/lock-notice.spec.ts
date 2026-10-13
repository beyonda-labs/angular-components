import { EditLock, EditLockState } from '../../../services/edit-lock/models/edit-lock.model';
import { NoticeActionType, NoticeConfig, NoticeVariant } from '../../notice/models/notice.model';
import {
    EditLockNoticeConfig,
    EditLockNoticeConfigParameters,
    LockNoticeOptions
} from '../models/edit-lock-notice.model';
import { buildLockNotice } from './lock-notice';

const COLLEAGUE: EditLock = {
    acquiredAt: new Date(2026, 9, 11, 9, 5).getTime(),
    canRelease: false,
    expiresAt: new Date(2026, 9, 11, 10, 2).getTime(),
    holderId: 'u2',
    holderName: 'Grace Hopper',
    isOwn: false,
    isSameUser: false
};
const OTHER_WINDOW: EditLock = { ...COLLEAGUE, holderId: 'u1', holderName: 'Ada Lovelace', isSameUser: true };
const OWN: EditLock = { ...OTHER_WINDOW, isOwn: true };

describe('buildLockNotice', () => {
    let options: LockNoticeOptions;

    function buildOptions(config: EditLockNoticeConfigParameters = {}): LockNoticeOptions {
        return {
            config: new EditLockNoticeConfig({ prefix: 'demo.lock', ...config }),
            language: 'en',
            onAcquire: jest.fn(),
            onRelease: jest.fn(),
            onTakeOver: jest.fn(),
            translate: key => (key === 'angular-components.user-name.unknown' ? 'Unknown' : key)
        };
    }

    function build(state: EditLockState): NoticeConfig {
        const notice = buildLockNotice(state, options);

        if (!notice) {
            throw new Error('No notice');
        }

        return notice;
    }

    function actionKeys(notice: NoticeConfig): string[] {
        return notice.actions.map(action => action.key);
    }

    function runAction(notice: NoticeConfig, key: string): void {
        notice.actions.find(action => action.key === key)?.action();
    }

    beforeEach(() => {
        jest.useFakeTimers({ now: new Date(2026, 9, 11, 10, 0) });
        options = buildOptions();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('says nothing while the window acquires the lock or holds it', () => {
        expect(buildLockNotice({ lock: null, status: 'acquiring' }, options)).toBeNull();
        expect(buildLockNotice({ lock: OWN, status: 'own' }, options)).toBeNull();
    });

    it('warns that a colleague edits it since today, with nothing to release for whom may not', () => {
        const notice = build({ lock: COLLEAGUE, status: 'held' });

        expect(notice).toEqual(
            expect.objectContaining({
                message: 'demo.lock.messages.held.today',
                messageParameters: { date: 'Oct 11, 2026', name: 'Grace Hopper', time: '9:05 AM' },
                variant: NoticeVariant.Warning
            })
        );
        expect(actionKeys(notice)).toEqual([]);
    });

    it('gives the earlier message when the editing started on another day', () => {
        const notice = build({
            lock: { ...COLLEAGUE, acquiredAt: new Date(2026, 9, 9, 16, 30).getTime() },
            status: 'held'
        });

        expect(notice.message).toBe('demo.lock.messages.held.earlier');
        expect(notice.messageParameters).toEqual({ date: 'Oct 9, 2026', name: 'Grace Hopper', time: '4:30 PM' });
    });

    it('offers the release to whom may do it, with the name of the holder or the unknown one', () => {
        const notice = build({ lock: { ...COLLEAGUE, canRelease: true, holderName: null }, status: 'held' });

        runAction(notice, 'release');

        expect(notice.messageParameters).toEqual(expect.objectContaining({ name: 'Unknown' }));
        expect(options.onRelease).toHaveBeenCalledWith('Unknown');
    });

    it('offers the same user to edit here, taking the lock over at once without onEdit', () => {
        const notice = build({ lock: OTHER_WINDOW, status: 'held' });

        runAction(notice, 'take-over');

        expect(notice).toEqual(
            expect.objectContaining({ message: 'demo.lock.messages.other-window', variant: NoticeVariant.Info })
        );
        expect(notice.actions[0].type).toBe(NoticeActionType.Primary);
        expect(options.onTakeOver).toHaveBeenCalledTimes(1);
    });

    it('hands onEdit the claim instead of claiming, for the product to reload first', () => {
        const onEdit = jest.fn();
        options = buildOptions({ onEdit });

        runAction(build({ lock: OTHER_WINDOW, status: 'held' }), 'take-over');
        runAction(build({ lock: null, status: 'free' }), 'edit');

        expect(options.onTakeOver).not.toHaveBeenCalled();
        expect(options.onAcquire).not.toHaveBeenCalled();

        onEdit.mock.calls.forEach(([claim]) => claim());

        expect(options.onTakeOver).toHaveBeenCalledTimes(1);
        expect(options.onAcquire).toHaveBeenCalledTimes(1);
    });

    it('says why the lock was lost, naming who took it', () => {
        expect(build({ lock: null, status: 'lost' }).message).toBe('demo.lock.messages.lost.released');
        expect(build({ lock: OTHER_WINDOW, status: 'lost' }).message).toBe('demo.lock.messages.lost.other-window');
        expect(build({ lock: COLLEAGUE, status: 'lost' })).toEqual(
            expect.objectContaining({
                message: 'demo.lock.messages.lost.taken',
                messageParameters: { name: 'Grace Hopper' },
                variant: NoticeVariant.Danger
            })
        );
    });

    it('offers to save a copy only with onSaveCopy, first once lost and after the edit once free', () => {
        expect(actionKeys(build({ lock: null, status: 'lost' }))).toEqual([]);
        expect(actionKeys(build({ lock: null, status: 'free' }))).toEqual(['edit']);

        const onSaveCopy = jest.fn();
        options = buildOptions({ onSaveCopy });

        expect(actionKeys(build({ lock: null, status: 'lost' }))).toEqual(['save-copy']);
        expect(actionKeys(build({ lock: null, status: 'free' }))).toEqual(['edit', 'save-copy']);

        runAction(build({ lock: null, status: 'lost' }), 'save-copy');

        expect(onSaveCopy).toHaveBeenCalledTimes(1);
    });

    it('says the row is no longer available, with nothing to do about it', () => {
        const notice = build({ lock: null, status: 'unavailable' });

        expect(notice).toEqual(
            expect.objectContaining({ message: 'demo.lock.messages.unavailable', variant: NoticeVariant.Danger })
        );
        expect(actionKeys(notice)).toEqual([]);
    });
});
