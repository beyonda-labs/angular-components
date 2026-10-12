import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { faLock, faLockOpen, faTriangleExclamation, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs';

import { userNameOrUnknown } from '../../internal/user-name/user-name';
import { EditLockService } from '../../services/edit-lock/edit-lock.service';
import { EditLock } from '../../services/edit-lock/models/edit-lock.model';
import { ModalService } from '../modal/services/modal.service';
import { NoticeAction, NoticeActionType, NoticeConfig, NoticeVariant } from '../notice/models/notice.model';
import { NoticeComponent } from '../notice/notice.component';
import { describeLockTime } from './functions/lock-time';
import { EditLockNoticeConfig } from './models/edit-lock-notice.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NoticeComponent],
    selector: 'bey-edit-lock-notice',
    standalone: true,
    styleUrls: ['./edit-lock-notice.component.css'],
    templateUrl: './edit-lock-notice.component.html'
})
export class EditLockNoticeComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly editLockService = inject(EditLockService);
    private readonly modalService = inject(ModalService);
    private readonly translateService = inject(TranslateService);

    readonly config = input.required<EditLockNoticeConfig>();

    readonly notice = computed(() => {
        const { lock, status } = this.editLockService.state();
        const config = this.config();

        switch (status) {
            case 'free':
                return this.freeNotice(config);
            case 'held':
                return lock ? this.heldNotice(config, lock) : null;
            case 'lost':
                return this.lostNotice(config, lock);
            case 'unavailable':
                return new NoticeConfig({
                    message: `${config.prefix}.messages.unavailable`,
                    variant: NoticeVariant.Danger
                });
            default:
                return null;
        }
    });

    private readonly language = toSignal(this.translateService.onLangChange.pipe(map(({ lang }) => lang)), {
        initialValue: this.translateService.currentLang || this.translateService.getDefaultLang()
    });

    private confirmRelease(prefix: string, lock: EditLock): void {
        this.modalService
            .openConfirmation({
                confirmLabel: `${prefix}.release-confirmation.confirm`,
                message: `${prefix}.release-confirmation.message`,
                messageParameters: { name: this.holderName(lock) },
                title: `${prefix}.release-confirmation.title`
            })
            .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.editLockService.releaseOther());
    }

    private edit({ onEdit }: EditLockNoticeConfig, claim: () => void): void {
        if (onEdit) {
            onEdit(claim);
        } else {
            claim();
        }
    }

    private freeNotice(config: EditLockNoticeConfig): NoticeConfig {
        return new NoticeConfig({
            actions: [
                new NoticeAction({
                    action: () => this.edit(config, () => this.editLockService.acquire()),
                    key: 'edit',
                    label: `${config.prefix}.actions.edit`,
                    type: NoticeActionType.Primary
                }),
                ...this.saveCopyActions(config, NoticeActionType.Secondary)
            ],
            icon: faLockOpen,
            message: `${config.prefix}.messages.free`
        });
    }

    private heldNotice(config: EditLockNoticeConfig, lock: EditLock): NoticeConfig {
        const { prefix } = config;

        if (lock.isSameUser) {
            return new NoticeConfig({
                actions: [
                    new NoticeAction({
                        action: () => this.edit(config, () => this.editLockService.takeOver()),
                        key: 'take-over',
                        label: `${prefix}.actions.take-over`,
                        type: NoticeActionType.Primary
                    })
                ],
                icon: faWindowRestore,
                message: `${prefix}.messages.other-window`
            });
        }

        const { date, isToday, time } = describeLockTime(lock.acquiredAt, this.language());

        return new NoticeConfig({
            actions: lock.canRelease
                ? [
                      new NoticeAction({
                          action: () => this.confirmRelease(prefix, lock),
                          key: 'release',
                          label: `${prefix}.actions.release`
                      })
                  ]
                : [],
            icon: faLock,
            message: `${prefix}.messages.held.${isToday ? 'today' : 'earlier'}`,
            messageParameters: { date, name: this.holderName(lock), time },
            variant: NoticeVariant.Warning
        });
    }

    private holderName({ holderName }: EditLock): string {
        return userNameOrUnknown(holderName, key => this.translateService.instant(key) as string);
    }

    private lostNotice(config: EditLockNoticeConfig, lock: EditLock | null): NoticeConfig {
        return new NoticeConfig({
            actions: this.saveCopyActions(config, NoticeActionType.Primary),
            icon: faTriangleExclamation,
            message: `${config.prefix}.messages.lost.${lostReason(lock)}`,
            messageParameters: lock ? { name: this.holderName(lock) } : undefined,
            variant: NoticeVariant.Danger
        });
    }

    private saveCopyActions({ onSaveCopy, prefix }: EditLockNoticeConfig, type: NoticeActionType): NoticeAction[] {
        return onSaveCopy
            ? [new NoticeAction({ action: onSaveCopy, key: 'save-copy', label: `${prefix}.actions.save-copy`, type })]
            : [];
    }
}

function lostReason(lock: EditLock | null): string {
    if (!lock) {
        return 'released';
    }

    return lock.isSameUser ? 'other-window' : 'taken';
}
