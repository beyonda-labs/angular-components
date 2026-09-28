import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { LoginProvider, LoginProviderConfig } from '../../models/login.model';

const ICONS: Record<LoginProvider, IconDefinition> = {
    facebook: faFacebookF,
    google: faGoogle,
    microsoft: faMicrosoft
};

interface ProviderButton {
    button: ButtonConfig;
    provider: LoginProviderConfig;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-login-providers',
    standalone: true,
    styleUrls: ['./login-providers.component.css'],
    templateUrl: './login-providers.component.html'
})
export class LoginProvidersComponent {
    readonly prefix = input.required<string>();
    readonly providers = input.required<LoginProviderConfig[]>();

    readonly providerClick = output<LoginProviderConfig>();

    readonly buttons = computed<ProviderButton[]>(() =>
        this.providers()
            .filter(provider => ICONS[provider.id])
            .map(provider => {
                const name = `angular-components.login.provider.${provider.id}`;

                return {
                    button: new ButtonConfig({
                        action: () => this.providerClick.emit(provider),
                        ariaLabel: name,
                        icon: ICONS[provider.id],
                        tooltip: name,
                        type: ButtonType.Secondary
                    }),
                    provider
                };
            })
    );
    readonly label = computed(() => `${this.prefix()}.login.signin-with`);
}
