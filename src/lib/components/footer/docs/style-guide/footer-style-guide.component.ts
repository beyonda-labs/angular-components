import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from '../../footer.component';
import { FooterConfig } from '../../models/footer.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FooterComponent, TranslateModule],
    selector: 'bey-footer-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './footer-style-guide.component.html'
})
export class FooterStyleGuideComponent {
    minimalConfig: FooterConfig;
    fullConfig: FooterConfig;

    constructor() {
        this.minimalConfig = new FooterConfig({
            iconSrc: '',
            productName: 'angular-components-style-guide.footer.minimal.product-name'
        });

        this.fullConfig = new FooterConfig({
            iconSrc: '',
            orgName: 'angular-components-style-guide.footer.with-links.org-name',
            productName: 'angular-components-style-guide.footer.with-links.product-name',
            privacyUrl: '/privacy',
            termsUrl: '/terms'
        });
    }
}
