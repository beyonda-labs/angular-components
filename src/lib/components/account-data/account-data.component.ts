import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { SettingsSectionComponent } from '../../internal/settings-section/settings-section.component';
import { AccountService } from '../../services/account/account.service';
import { FormComponent } from '../form/form.component';
import { AccountDataConfig, AccountDataTexts } from './models/account-data.model';
import { AccountDataFormService } from './services/account-data-form.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormComponent, SettingsSectionComponent],
    selector: 'bey-account-data',
    standalone: true,
    styleUrls: ['./account-data.component.css'],
    templateUrl: './account-data.component.html'
})
export class AccountDataComponent {
    private readonly accountDataFormService = inject(AccountDataFormService);
    private readonly accountService = inject(AccountService);

    readonly config = input.required<AccountDataConfig>();

    readonly form = computed(() => {
        const config = this.config();
        const profile = this.accountService.profile();

        return profile
            ? this.accountDataFormService.buildForm(config, profile, value =>
                  this.accountService.saveProfile(config.baseUrl, value, `${config.prefix}.toast.success`)
              )
            : null;
    });
    readonly texts = computed<AccountDataTexts>(() => {
        const { prefix } = this.config();

        return { description: `${prefix}.description`, title: `${prefix}.title` };
    });

    constructor() {
        effect(() => {
            const { baseUrl } = this.config();

            untracked(() => this.accountService.load(baseUrl));
        });
    }
}
