import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    BeyAccountDataComponent,
    BeyAccountDataConfig,
    BeyAccountDataField,
    BeyAccountDataFieldKey
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';

const BASE_URL = '/style-guide/account';
const PREFIX = 'angular-components-style-guide.account-data';
const CUSTOM_CONFIG = new BeyAccountDataConfig({
    baseUrl: BASE_URL,
    fields: [
        new BeyAccountDataField({ hint: `${PREFIX}.name-hint`, isRequired: true, key: BeyAccountDataFieldKey.Name }),
        new BeyAccountDataField({ columns: 6, hint: '', key: BeyAccountDataFieldKey.Email })
    ]
});
const DEFAULT_CONFIG = new BeyAccountDataConfig({ baseUrl: BASE_URL });

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAccountDataComponent, TranslateModule],
    selector: 'bey-account-data-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './account-data-style-guide.component.html'
})
export class AccountDataStyleGuideComponent {
    readonly buttons = computed<StyleGuideButton[]>(() => [
        {
            action: () => this.config.set(DEFAULT_CONFIG),
            isPrimary: this.config() === DEFAULT_CONFIG,
            label: `${PREFIX}.examples.default`
        },
        {
            action: () => this.config.set(CUSTOM_CONFIG),
            isPrimary: this.config() === CUSTOM_CONFIG,
            label: `${PREFIX}.examples.custom`
        }
    ]);
    readonly config = signal(DEFAULT_CONFIG);
}
