import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsSectionComponent } from '../../internal/settings-section/settings-section.component';
import { AccountService } from '../../services/account/account.service';
import { FormComponent } from '../form/form.component';
import { PasswordChangeConfig, PasswordChangeTexts } from './models/password-change.model';
import { PasswordChangeFormService } from './services/password-change-form.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, SettingsSectionComponent, TranslateModule],
    selector: 'bey-password-change',
    standalone: true,
    styleUrls: ['./password-change.component.css'],
    templateUrl: './password-change.component.html'
})
export class PasswordChangeComponent {
    private readonly accountService = inject(AccountService);
    private readonly passwordChangeFormService = inject(PasswordChangeFormService);

    readonly config = input.required<PasswordChangeConfig>();

    readonly form = computed(() => {
        const { baseUrl, prefix } = this.config();

        return this.passwordChangeFormService.buildForm(prefix, (value, handle) =>
            this.accountService.changePassword(baseUrl, value, `${prefix}.toast.success`, handle)
        );
    });
    readonly profile = this.accountService.profile;
    readonly texts = computed<PasswordChangeTexts>(() => {
        const { prefix } = this.config();

        return {
            description: `${prefix}.description`,
            noPassword: `${prefix}.no-password`,
            title: `${prefix}.title`
        };
    });

    constructor() {
        effect(() => {
            const { baseUrl } = this.config();

            untracked(() => this.accountService.load(baseUrl));
        });
    }
}
