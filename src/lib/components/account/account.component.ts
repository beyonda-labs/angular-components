import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FormComponent } from '../form/form.component';
import { HeaderComponent } from '../header/header.component';
import { HeaderConfig } from '../header/models/header.model';
import { AccountConfig, AccountTexts } from './models/account.model';
import { AccountService } from './services/account.service';
import { AccountFormService } from './services/account-form.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, HeaderComponent, TranslateModule],
    providers: [AccountService],
    selector: 'bey-account',
    standalone: true,
    styleUrls: ['./account.component.css'],
    templateUrl: './account.component.html'
})
export class AccountComponent {
    private readonly accountFormService = inject(AccountFormService);
    private readonly accountService = inject(AccountService);

    readonly config = input.required<AccountConfig>();

    readonly hasPassword = computed(() => this.accountService.profile()?.hasPassword ?? false);
    readonly headerConfig = computed(
        () => new HeaderConfig({ prefix: this.config().prefix, title: this.texts().title })
    );
    readonly passwordForm = computed(() =>
        this.accountFormService.buildPasswordForm(this.config().prefix, (value, handle) =>
            this.accountService.changePassword(this.config(), value, handle)
        )
    );
    readonly profileForm = computed(() => {
        const profile = this.accountService.profile();

        return profile
            ? this.accountFormService.buildProfileForm(this.config().prefix, profile, value =>
                  this.accountService.saveProfile(this.config(), value)
              )
            : null;
    });
    readonly texts = computed<AccountTexts>(() => {
        const { prefix } = this.config();

        return {
            noPassword: `${prefix}.password.no-password`,
            passwordTitle: `${prefix}.password.title`,
            profileTitle: `${prefix}.profile.title`,
            title: `${prefix}.title`
        };
    });

    constructor() {
        effect(() => {
            const config = this.config();

            untracked(() => this.accountService.load(config));
        });
    }
}
