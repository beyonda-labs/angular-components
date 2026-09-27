import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyFooterComponent, BeyFooterConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyFooterComponent, TranslateModule],
    selector: 'bey-footer-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './footer-style-guide.component.html'
})
export class FooterStyleGuideComponent {
    fullConfig: BeyFooterConfig;
    minimalConfig: BeyFooterConfig;

    constructor() {
        this.minimalConfig = new BeyFooterConfig({
            iconSrc: '',
            productName: 'angular-components-style-guide.footer.minimal.product-name'
        });

        this.fullConfig = new BeyFooterConfig({
            iconSrc: '',
            orgName: 'angular-components-style-guide.footer.with-links.org-name',
            productName: 'angular-components-style-guide.footer.with-links.product-name',
            privacyUrl: '/privacy',
            termsUrl: '/terms'
        });
    }
}
