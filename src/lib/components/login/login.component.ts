import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { ThemeService } from '../../services/theme/theme.service';
import { FloatingPreferencesComponent } from '../floating-preferences/floating-preferences.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LoginRegisterFormComponent } from './components/login-register-form/login-register-form.component';
import { LoginConfig, LoginProviderConfig, RegisterField } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

const BG_IMAGE_LIGHT = 'assets/angular-components/images/login-bg-light.avif';
const BG_IMAGE_DARK = 'assets/angular-components/images/login-bg-dark.avif';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ButtonComponent,
        TranslateModule,
        LoginFormComponent,
        LoginRegisterFormComponent,
        FloatingPreferencesComponent,
        FooterComponent
    ],
    selector: 'bey-login',
    standalone: true,
    styleUrls: ['./login.component.css'],
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    @Input({ required: true })
    set config(value: LoginConfig) {
        this._config = value;
        this.cdr.markForCheck();
    }
    get config(): LoginConfig {
        return this._config;
    }

    activeView: 'login' | 'register' = 'login';
    providers: LoginProviderConfig[] = [];
    registerFields: RegisterField[] = [];

    private _config!: LoginConfig;
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly loginHttpService = inject(LoginHttpService);
    private readonly themeService = inject(ThemeService);

    get prefix(): string {
        return this.config.translatePrefix;
    }

    get bgImage(): string {
        return this.themeService.currentTheme === 'dark' ? BG_IMAGE_DARK : BG_IMAGE_LIGHT;
    }

    ngOnInit(): void {
        this.loginHttpService.getRegisterFields().subscribe(fields => {
            this.registerFields = fields;
            this.cdr.markForCheck();
        });

        this.loginHttpService.getProviders().subscribe(providers => {
            this.providers = providers;
            this.cdr.markForCheck();
        });
    }

    getTabButton(view: 'login' | 'register'): ButtonConfig {
        return new ButtonConfig({
            label: `${this.prefix}.${view}.button.${view}`,
            type: ButtonType.Secondary,
            action: () => this.setView(view),
            customClass: 'w-100 d-block ms-0 justify-content-center',
            customStyles: 'width: 100%'
        });
    }

    setView(view: 'login' | 'register'): void {
        this.activeView = view;
        this.cdr.markForCheck();
    }
}
