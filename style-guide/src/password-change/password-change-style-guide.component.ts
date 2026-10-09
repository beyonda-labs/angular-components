import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyPasswordChangeComponent, BeyPasswordChangeConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyPasswordChangeComponent, TranslateModule],
    selector: 'bey-password-change-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './password-change-style-guide.component.html'
})
export class PasswordChangeStyleGuideComponent {
    readonly config = new BeyPasswordChangeConfig({ baseUrl: '/style-guide/account' });
}
