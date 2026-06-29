import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { LoginProviderConfig } from '../../models/login.model';

@Component({
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-login-providers',
    standalone: true,
    templateUrl: './login-providers.component.html'
})
export class LoginProvidersComponent {
    @Input({ required: true }) prefix!: string;
    @Input({ required: true }) providers!: LoginProviderConfig[];
    @Output() providerClick = new EventEmitter<LoginProviderConfig>();

    readonly icons: Record<string, IconDefinition> = {
        facebook: faFacebookF,
        google: faGoogle,
        microsoft: faMicrosoft
    };

    getProviderButton(provider: LoginProviderConfig): ButtonConfig {
        return new ButtonConfig({
            action: () => this.providerClick.emit(provider),
            icon: this.icons[provider.id],
            type: ButtonType.Secondary,
            tooltip: `angular-components.login.provider.${provider.id}`
        });
    }
}
