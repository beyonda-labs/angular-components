import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ButtonConfig, ButtonType } from './models/button-config.model';

const BASE_CLASSES = 'bey-button btn d-flex align-items-center';
const SMALL_BUTTON_CLASSES = 'btn-sm fw-semibold';
const TYPE_CLASSES: Record<ButtonType, string> = {
    [ButtonType.IconOutline]: 'bey-button--icon-outline',
    [ButtonType.LinkSecondary]: `${SMALL_BUTTON_CLASSES} btn-link btn-link-secondary`,
    [ButtonType.Primary]: `${SMALL_BUTTON_CLASSES} btn-dark`,
    [ButtonType.Secondary]: `${SMALL_BUTTON_CLASSES} btn-outline-dark`,
    [ButtonType.Tertiary]: `${SMALL_BUTTON_CLASSES} btn-link`
};

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[class]': 'hostClass()' },
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-button',
    standalone: true,
    styleUrls: ['./button.component.css'],
    templateUrl: './button.component.html'
})
export class ButtonComponent {
    readonly button = input.required<ButtonConfig>();

    readonly classes = computed(() => {
        const { customClass, type } = this.button();

        return [BASE_CLASSES, TYPE_CLASSES[type], customClass].filter(Boolean).join(' ');
    });
    readonly hostClass = computed(() => this.button().customClass ?? '');

    onClick(): void {
        const button = this.button();

        if (!button.isDisabled) {
            button.action();
        }
    }
}
