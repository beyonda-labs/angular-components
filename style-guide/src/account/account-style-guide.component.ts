import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyAccountComponent, BeyAccountConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAccountComponent, TranslateModule],
    selector: 'bey-account-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './account-style-guide.component.html'
})
export class AccountStyleGuideComponent {
    readonly config = new BeyAccountConfig({ baseUrl: '/style-guide/account' });
}
