import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { ThemeService } from '../../services/theme/theme.service';
import { FooterComponent } from '../footer/footer.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LoginRegisterFormComponent } from './components/login-register-form/login-register-form.component';
import { LoginConfig } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

type LoginView = 'login' | 'register';

const BG_IMAGE_LIGHT = 'assets/angular-components/images/login-bg-light.avif';
const BG_IMAGE_DARK = 'assets/angular-components/images/login-bg-dark.avif';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FooterComponent, LoginFormComponent, LoginRegisterFormComponent, TranslateModule],
    selector: 'bey-login',
    standalone: true,
    styleUrls: ['./login.component.css'],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    readonly config = input.required<LoginConfig>();

    private readonly loginHttpService = inject(LoginHttpService);
    private readonly themeService = inject(ThemeService);

    readonly activeView = signal<LoginView>('login');
    readonly providers = toSignal(this.loginHttpService.getProviders(), { initialValue: [] });
    readonly registerFields = toSignal(this.loginHttpService.getRegisterFields(), { initialValue: [] });
    readonly theme = toSignal(this.themeService.theme$, { requireSync: true });

    readonly backgroundImage = computed(() => `url(${this.theme() === 'dark' ? BG_IMAGE_DARK : BG_IMAGE_LIGHT})`);
    readonly canRegister = computed(() => this.registerFields().length > 0);
    readonly isRegistering = computed(() => this.canRegister() && this.activeView() === 'register');
    readonly prefix = computed(() => this.config().prefix);
    readonly title = computed(() => `${this.prefix()}.title.${this.isRegistering() ? 'register' : 'login'}`);
    readonly viewButton = computed(() => {
        const view: LoginView = this.isRegistering() ? 'login' : 'register';

        return new ButtonConfig({
            action: () => this.activeView.set(view),
            customClass: 'w-100 d-block ms-0 justify-content-center',
            customStyles: 'width: 100%',
            label: `${this.prefix()}.${view}.button.${view}`,
            type: ButtonType.Secondary
        });
    });
}
