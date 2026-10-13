import { faLock, faLockOpen, faTriangleExclamation, faWindowRestore } from '@fortawesome/free-solid-svg-icons';

import { userNameOrUnknown } from '../../../internal/user-name/user-name';
import { EditLock, EditLockState } from '../../../services/edit-lock/models/edit-lock.model';
import { NoticeAction, NoticeActionType, NoticeConfig, NoticeVariant } from '../../notice/models/notice.model';
import { EditLockNoticeConfig, LockNoticeOptions } from '../models/edit-lock-notice.model';
import { describeLockTime } from './lock-time';

export function buildLockNotice({ lock, status }: EditLockState, options: LockNoticeOptions): NoticeConfig | null {
    switch (status) {
        case 'free':
            return freeNotice(options);
        case 'held':
            return lock ? heldNotice(lock, options) : null;
        case 'lost':
            return lostNotice(lock, options);
        case 'unavailable':
            return new NoticeConfig({
                message: `${options.config.prefix}.messages.unavailable`,
                variant: NoticeVariant.Danger
            });
        default:
            return null;
    }
}

function claimWith({ onEdit }: EditLockNoticeConfig, claim: () => void): void {
    if (onEdit) {
        onEdit(claim);
    } else {
        claim();
    }
}

function freeNotice({ config, onAcquire }: LockNoticeOptions): NoticeConfig {
    return new NoticeConfig({
        actions: [
            new NoticeAction({
                action: () => claimWith(config, onAcquire),
                key: 'edit',
                label: `${config.prefix}.actions.edit`,
                type: NoticeActionType.Primary
            }),
            ...saveCopyActions(config, NoticeActionType.Secondary)
        ],
        icon: faLockOpen,
        message: `${config.prefix}.messages.free`
    });
}

function heldNotice(
    lock: EditLock,
    { config, language, onRelease, onTakeOver, translate }: LockNoticeOptions
): NoticeConfig {
    const { prefix } = config;

    if (lock.isSameUser) {
        return new NoticeConfig({
            actions: [
                new NoticeAction({
                    action: () => claimWith(config, onTakeOver),
                    key: 'take-over',
                    label: `${prefix}.actions.take-over`,
                    type: NoticeActionType.Primary
                })
            ],
            icon: faWindowRestore,
            message: `${prefix}.messages.other-window`
        });
    }

    const { date, isToday, time } = describeLockTime(lock.acquiredAt, language);
    const name = userNameOrUnknown(lock.holderName, translate);

    return new NoticeConfig({
        actions: lock.canRelease
            ? [new NoticeAction({ action: () => onRelease(name), key: 'release', label: `${prefix}.actions.release` })]
            : [],
        icon: faLock,
        message: `${prefix}.messages.held.${isToday ? 'today' : 'earlier'}`,
        messageParameters: { date, name, time },
        variant: NoticeVariant.Warning
    });
}

function lostNotice(lock: EditLock | null, { config, translate }: LockNoticeOptions): NoticeConfig {
    return new NoticeConfig({
        actions: saveCopyActions(config, NoticeActionType.Primary),
        icon: faTriangleExclamation,
        message: `${config.prefix}.messages.lost.${lostReason(lock)}`,
        messageParameters: lock ? { name: userNameOrUnknown(lock.holderName, translate) } : undefined,
        variant: NoticeVariant.Danger
    });
}

function lostReason(lock: EditLock | null): string {
    if (!lock) {
        return 'released';
    }

    return lock.isSameUser ? 'other-window' : 'taken';
}

function saveCopyActions({ onSaveCopy, prefix }: EditLockNoticeConfig, type: NoticeActionType): NoticeAction[] {
    return onSaveCopy
        ? [new NoticeAction({ action: onSaveCopy, key: 'save-copy', label: `${prefix}.actions.save-copy`, type })]
        : [];
}
