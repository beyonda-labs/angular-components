import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from '../../login.component';
import { LoginConfig } from '../../models/login.model';

@Component({
    imports: [LoginComponent, TranslateModule],
    selector: 'bey-login-style-guide',
    standalone: true,
    styleUrls: ['./login-style-guide.component.css'],
    templateUrl: './login-style-guide.component.html'
})
export class LoginStyleGuideComponent {
    private readonly prefix = 'angular-components-style-guide.login.demo';

    private readonly baseConfig = {
        iconSrc: 'assets/angular-components/icons/demo-icon.svg',
        orgName: 'Beyonda Labs',
        productName: `${this.prefix}.productName`,
        productDescription: `${this.prefix}.productDescription`,
        privacyUrl: '/privacy',
        termsUrl: '/terms'
    };

    config = new LoginConfig({ ...this.baseConfig });
}
