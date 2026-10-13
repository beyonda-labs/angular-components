import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
    BeyEditLock,
    BeyEditLockNoticeComponent,
    BeyEditLockNoticeConfig,
    BeyEditLockService,
    BeyEditLockState,
    BeyToastService
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';
import { StyleGuideEditLockService } from './services/style-guide-edit-lock.service';

const DAY_MS = 86400000;
const MINUTE_MS = 60000;
const PREFIX = 'angular-components-style-guide.edit-lock-notice';
const STARTED_MINUTES_AGO = 25;

const COLLEAGUE: BeyEditLock = {
    acquiredAt: 0,
    canRelease: false,
    expiresAt: 0,
    holderId: 'u2',
    holderName: 'Grace Hopper',
    isOwn: false,
    isSameUser: false
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyEditLockNoticeComponent, TranslateModule],
    providers: [StyleGuideEditLockService, { provide: BeyEditLockService, useExisting: StyleGuideEditLockService }],
    selector: 'bey-edit-lock-notice-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './edit-lock-notice-style-guide.component.html'
})
export class EditLockNoticeStyleGuideComponent {
    private readonly editLockService = inject(StyleGuideEditLockService);
    private readonly toastService = inject(BeyToastService);

    readonly config = new BeyEditLockNoticeConfig({
        onEdit: claim => {
            this.toastService.showInfo({ message: `${PREFIX}.toast.reloaded` });
            claim();
        },
        onSaveCopy: () => this.toastService.showSuccess({ message: `${PREFIX}.toast.copy-saved` })
    });
    readonly scenarios: StyleGuideButton[] = [
        this.scenario('colleague', () => this.held({})),
        this.scenario('manager', () => this.held({ canRelease: true })),
        this.scenario('earlier', () => this.held({ acquiredAt: Date.now() - DAY_MS })),
        this.scenario('other-window', () => this.held({ isSameUser: true })),
        this.scenario('taken', () => ({ lock: this.lock({}), status: 'lost' })),
        this.scenario('released', () => ({ lock: null, status: 'lost' })),
        this.scenario('free', () => ({ lock: null, status: 'free' })),
        this.scenario('unavailable', () => ({ lock: null, status: 'unavailable' }))
    ];
    readonly status = computed(() => `${PREFIX}.statuses.${this.editLockService.state().status}`);

    private held(overrides: Partial<BeyEditLock>): BeyEditLockState {
        return { lock: this.lock(overrides), status: 'held' };
    }

    private lock(overrides: Partial<BeyEditLock>): BeyEditLock {
        return { ...COLLEAGUE, acquiredAt: Date.now() - STARTED_MINUTES_AGO * MINUTE_MS, ...overrides };
    }

    private scenario(key: string, build: () => BeyEditLockState): StyleGuideButton {
        return { action: () => this.editLockService.show(build()), label: `${PREFIX}.scenarios.${key}` };
    }
}
