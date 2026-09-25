import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyLoginComponent, BeyLoginConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.login.demo';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyLoginComponent, TranslateModule],
    selector: 'bey-login-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './login-style-guide.component.css'],
    templateUrl: './login-style-guide.component.html'
})
export class LoginStyleGuideComponent {
    readonly config = new BeyLoginConfig({
        iconSrc: 'assets/angular-components/icons/demo-icon.svg',
        orgName: 'Beyonda Labs',
        privacyUrl: '/privacy',
        productDescription: `${PREFIX}.product-description`,
        productName: `${PREFIX}.product-name`,
        termsUrl: '/terms'
    });
}
