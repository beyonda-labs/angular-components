import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs';

import { EditLockService } from '../../services/edit-lock/edit-lock.service';
import { ModalService } from '../modal/services/modal.service';
import { NoticeComponent } from '../notice/notice.component';
import { buildLockNotice } from './functions/lock-notice';
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

    readonly notice = computed(() =>
        buildLockNotice(this.editLockService.state(), {
            config: this.config(),
            language: this.language(),
            onAcquire: () => this.editLockService.acquire(),
            onRelease: name => this.confirmRelease(name),
            onTakeOver: () => this.editLockService.takeOver(),
            translate: key => this.translateService.instant(key) as string
        })
    );

    private readonly language = toSignal(this.translateService.onLangChange.pipe(map(({ lang }) => lang)), {
        initialValue: this.translateService.currentLang || this.translateService.getDefaultLang()
    });

    private confirmRelease(name: string): void {
        const { prefix } = this.config();

        this.modalService
            .openConfirmation({
                confirmLabel: `${prefix}.release-confirmation.confirm`,
                message: `${prefix}.release-confirmation.message`,
                messageParameters: { name },
                title: `${prefix}.release-confirmation.title`
            })
            .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.editLockService.releaseOther());
    }
}
