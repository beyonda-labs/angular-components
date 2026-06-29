import { Component, HostBinding, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ButtonConfig, ButtonType } from './models/button-config.model';

@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-button',
    standalone: true,
    styleUrls: ['./button.component.css'],
    templateUrl: './button.component.html'
})
export class ButtonComponent {
    @Input() button: ButtonConfig;

    @HostBinding('class')
    get hostClass(): string {
        return this.button?.customClass ?? '';
    }

    getClasses(): string {
        if (!this.button) {
            return '';
        }

        const common = 'bey-button btn btn-sm d-flex align-items-center fw-semibold rounded';

        let classes: string;

        switch (this.button.type) {
            case ButtonType.Primary:
                classes = `${common} btn-dark`;
                break;

            case ButtonType.Secondary:
                classes = `${common} btn-outline-dark`;
                break;

            case ButtonType.Tertiary:
                classes = `${common} btn-link`;
                break;

            case ButtonType.LinkSecondary:
                classes = `${common} btn-link btn-link-secondary`;
                break;

            default:
                return '';
        }

        return this.button.customClass
            ? `${classes} ${this.button.customClass}`
            : classes;
    }

    onClick(): void {
        if (this.button && !this.button.isDisabled) {
            this.button.action();
        }
    }
}
