import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from '../../login.component';
import { LoginConfig } from '../../models/login.model';

const PREFIX = 'angular-components-style-guide.login.demo';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoginComponent, TranslateModule],
    selector: 'bey-login-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './login-style-guide.component.css'],
    templateUrl: './login-style-guide.component.html'
})
export class LoginStyleGuideComponent {
    readonly config = new LoginConfig({
        iconSrc: 'assets/angular-components/icons/demo-icon.svg',
        orgName: 'Beyonda Labs',
        privacyUrl: '/privacy',
        productDescription: `${PREFIX}.product-description`,
        productName: `${PREFIX}.product-name`,
        termsUrl: '/terms'
    });
}
