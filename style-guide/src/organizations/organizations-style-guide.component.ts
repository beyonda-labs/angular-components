import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyOrganizationsComponent, BeyOrganizationsConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyOrganizationsComponent, TranslateModule],
    selector: 'bey-organizations-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './organizations-style-guide.component.html'
})
export class OrganizationsStyleGuideComponent {
    readonly config = new BeyOrganizationsConfig({
        baseUrl: '/style-guide/organizations',
        height: '24rem',
        storageKey: 'style-guide-organizations',
        usersUrl: '/style-guide/users'
    });
}
