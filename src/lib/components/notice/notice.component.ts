import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faCircleXmark, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { NoticeActionType, NoticeConfig, NoticeVariant } from './models/notice.model';

const BUTTON_TYPES: Record<NoticeActionType, ButtonType> = {
    [NoticeActionType.Primary]: ButtonType.Primary,
    [NoticeActionType.Secondary]: ButtonType.Secondary
};
const ICONS: Record<NoticeVariant, IconDefinition> = {
    [NoticeVariant.Danger]: faCircleXmark,
    [NoticeVariant.Info]: faCircleInfo,
    [NoticeVariant.Warning]: faTriangleExclamation
};
const ROLES: Record<NoticeVariant, string> = {
    [NoticeVariant.Danger]: 'alert',
    [NoticeVariant.Info]: 'status',
    [NoticeVariant.Warning]: 'status'
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-notice',
    standalone: true,
    styleUrls: ['./notice.component.css'],
    templateUrl: './notice.component.html'
})
export class NoticeComponent {
    readonly config = input.required<NoticeConfig>();

    readonly buttons = computed(() =>
        this.config().actions.map(action => ({
            button: new ButtonConfig({ action: action.action, label: action.label, type: BUTTON_TYPES[action.type] }),
            key: action.key
        }))
    );
    readonly icon = computed(() => this.config().icon ?? ICONS[this.config().variant]);
    readonly role = computed(() => ROLES[this.config().variant]);
    readonly variantClass = computed(() => `bey-notice--${this.config().variant}`);
}
