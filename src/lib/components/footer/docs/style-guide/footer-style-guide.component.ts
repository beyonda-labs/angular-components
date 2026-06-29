import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from '../../footer.component';
import { FooterConfig } from '../../models/footer.model';

@Component({
    imports: [FooterComponent, TranslateModule],
    selector: 'bey-footer-style-guide',
    standalone: true,
    templateUrl: './footer-style-guide.component.html'
})
export class FooterStyleGuideComponent {
    minimalConfig: FooterConfig;
    fullConfig: FooterConfig;

    constructor() {
        this.minimalConfig = new FooterConfig({
            iconSrc: '',
            productName: 'angular-components-style-guide.footer.minimal.productName'
        });

        this.fullConfig = new FooterConfig({
            iconSrc: '',
            orgName: 'angular-components-style-guide.footer.withLinks.orgName',
            productName: 'angular-components-style-guide.footer.withLinks.productName',
            privacyUrl: '/privacy',
            termsUrl: '/terms'
        });
    }
}
