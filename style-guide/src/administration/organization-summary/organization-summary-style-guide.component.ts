import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyOrganizationSummaryComponent, BeyOrganizationSummaryConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { STYLE_GUIDE_ROLE_SETTINGS } from '../models/administration-backend.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyOrganizationSummaryComponent, TranslateModule],
    selector: 'bey-organization-summary-style-guide',
    standalone: true,
    styleUrls: ['../../style-guide-shared.css'],
    templateUrl: './organization-summary-style-guide.component.html'
})
export class OrganizationSummaryStyleGuideComponent {
    readonly config = new BeyOrganizationSummaryConfig({
        organizationsUrl: '/style-guide/organizations',
        rolesConfig: STYLE_GUIDE_ROLE_SETTINGS
    });
}
