import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { LoginForgotPasswordComponent } from './components/login-forgot-password/login-forgot-password.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LoginRegisterFormComponent } from './components/login-register-form/login-register-form.component';
import { LoginShellComponent } from './components/login-shell/login-shell.component';
import { LoginAutofocusDirective } from './directives/login-autofocus.directive';
import { LOGIN_VIEW_PARAMETER, LoginConfig, LoginView } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

const STRETCHED_BUTTON_CLASS = 'w-100 d-block ms-0 justify-content-center';
const STRETCHED_BUTTON_STYLES = 'width: 100%';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ButtonComponent,
        LoginAutofocusDirective,
        LoginForgotPasswordComponent,
        LoginFormComponent,
        LoginRegisterFormComponent,
        LoginShellComponent,
        TranslateModule
    ],
    selector: 'bey-login',
    standalone: true,
    styleUrls: ['./login-page.styles.css', './login.component.css'],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly route = inject(ActivatedRoute, { optional: true });

    readonly config = input.required<LoginConfig>();

    readonly activeView = linkedSignal<LoginView>(() => this.initialView(this.config()));
    readonly backButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.showView('login'),
                customClass: STRETCHED_BUTTON_CLASS,
                customStyles: STRETCHED_BUTTON_STYLES,
                label: `${this.prefix()}.back-to-sign-in`,
                type: ButtonType.Secondary
            })
    );
    readonly canRegister = computed(() => this.registerFields().length > 0);
    readonly isViewSwitchVisible = computed(() => this.canRegister() && ['login', 'register'].includes(this.view()));
    readonly prefix = computed(() => this.config().prefix);
    readonly providers = toSignal(this.loginHttpService.getProviders(), { initialValue: [] });
    readonly registeredMessage = computed(() => `${this.prefix()}.registered.message`);
    readonly registerFields = toSignal(this.loginHttpService.getRegisterFields(), { initialValue: [] });
    readonly title = computed(() => `${this.prefix()}.title.${this.view()}`);
    readonly view = computed<LoginView>(() => {
        const view = this.activeView();

        return view === 'register' && !this.canRegister() ? 'login' : view;
    });
    readonly viewButton = computed(() => {
        const view: LoginView = this.view() === 'register' ? 'login' : 'register';

        return new ButtonConfig({
            action: () => this.showView(view),
            customClass: STRETCHED_BUTTON_CLASS,
            customStyles: STRETCHED_BUTTON_STYLES,
            label: `${this.prefix()}.${view}.button.${view}`,
            type: ButtonType.Secondary
        });
    });

    showView(view: LoginView): void {
        this.activeView.set(view);
    }

    private initialView({ isPasswordResetEnabled }: LoginConfig): LoginView {
        const isForgotRequested = this.route?.snapshot.queryParamMap.get(LOGIN_VIEW_PARAMETER) === 'forgot-password';

        return isPasswordResetEnabled && isForgotRequested ? 'forgot-password' : 'login';
    }
}
