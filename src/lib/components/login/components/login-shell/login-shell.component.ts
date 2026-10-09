import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { ThemeService } from '../../../../services/theme/theme.service';
import { FooterComponent } from '../../../footer/footer.component';
import { LoginConfig } from '../../models/login.model';

const BG_IMAGE_LIGHT = 'assets/angular-components/images/login-bg-light.avif';
const BG_IMAGE_DARK = 'assets/angular-components/images/login-bg-dark.avif';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FooterComponent, TranslateModule],
    selector: 'bey-login-shell',
    standalone: true,
    styleUrls: ['./login-shell.component.css'],
    templateUrl: './login-shell.component.html'
})
export class LoginShellComponent {
    private readonly themeService = inject(ThemeService);

    readonly config = input.required<LoginConfig>();
    readonly title = input.required<string>();

    readonly backgroundImage = computed(() => `url(${this.theme() === 'dark' ? BG_IMAGE_DARK : BG_IMAGE_LIGHT})`);
    readonly theme = toSignal(this.themeService.theme$, { requireSync: true });
}
