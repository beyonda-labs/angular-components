import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { HeaderAction, HeaderActionType, HeaderConfig } from './models/header.model';

@Component({
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-header',
    standalone: true,
    styleUrls: ['./header.component.css'],
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    @Input({ required: true }) config!: HeaderConfig;

    get leftActions(): HeaderAction[] {
        return this.config?.leftActions ?? [];
    }

    get rightActions(): HeaderAction[] {
        return this.config?.rightActions ?? [];
    }

    getTitle(): string {
        return this.config.title ?? '';
    }

    getActionButton(action: HeaderAction): ButtonConfig {
        return new ButtonConfig({
            action: action.action ?? (() => {}),
            icon: action.icon,
            label: this.resolveActionText(action, 'label'),
            tooltip: this.resolveActionText(action, 'tooltip'),
            type: this.getButtonType(action.type)
        });
    }

    private getButtonType(type: HeaderActionType): ButtonType {
        switch (type) {
            case HeaderActionType.PrimaryButton:
                return ButtonType.Primary;
            case HeaderActionType.SecondaryButton:
                return ButtonType.Secondary;
            case HeaderActionType.Text:
            default:
                return ButtonType.Tertiary;
        }
    }

    private resolveActionText(action: HeaderAction, field: 'label' | 'tooltip'): string {
        const value = action[field];
        const defaultValue = `${action.key}.${field}`;

        if (!value || value === defaultValue) {
            return `${this.config.prefix}.actions.${defaultValue}`;
        }

        return value;
    }
}
