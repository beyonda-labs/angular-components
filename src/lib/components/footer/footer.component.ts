import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { FooterConfig } from './models/footer.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-footer',
    standalone: true,
    styleUrls: ['./footer.component.css'],
    templateUrl: './footer.component.html'
})
export class FooterComponent {
    private readonly router = inject(Router);

    @Input({ required: true }) config!: FooterConfig;

    get termsButton(): ButtonConfig {
        return new ButtonConfig({
            label: 'angular-components.footer.terms',
            type: ButtonType.LinkSecondary,
            action: () => this.router.navigate([this.config.termsUrl])
        });
    }

    get privacyButton(): ButtonConfig {
        return new ButtonConfig({
            label: 'angular-components.footer.privacy',
            type: ButtonType.LinkSecondary,
            action: () => this.router.navigate([this.config.privacyUrl])
        });
    }
}
