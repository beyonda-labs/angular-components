import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { FloatingPreferencesComponent } from '../floating-preferences/floating-preferences.component';
import { FooterConfig } from './models/footer.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FloatingPreferencesComponent, TranslateModule],
    selector: 'bey-footer',
    standalone: true,
    styleUrls: ['./footer.component.css'],
    templateUrl: './footer.component.html'
})
export class FooterComponent {
    private readonly router = inject(Router);

    readonly config = input.required<FooterConfig>();

    readonly privacyButton = computed(
        () =>
            new ButtonConfig({
                label: 'angular-components.footer.privacy',
                type: ButtonType.LinkSecondary,
                action: () => this.router.navigate([this.config().privacyUrl])
            })
    );
    readonly termsButton = computed(
        () =>
            new ButtonConfig({
                label: 'angular-components.footer.terms',
                type: ButtonType.LinkSecondary,
                action: () => this.router.navigate([this.config().termsUrl])
            })
    );
}
