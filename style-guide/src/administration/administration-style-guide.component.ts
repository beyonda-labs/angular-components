import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { GroupsStyleGuideComponent } from './groups/groups-style-guide.component';
import { OrganizationsStyleGuideComponent } from './organizations/organizations-style-guide.component';
import { RolesStyleGuideComponent } from './roles/roles-style-guide.component';
import { UsersStyleGuideComponent } from './users/users-style-guide.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        GroupsStyleGuideComponent,
        OrganizationsStyleGuideComponent,
        RolesStyleGuideComponent,
        TranslateModule,
        UsersStyleGuideComponent
    ],
    selector: 'bey-administration-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './administration-style-guide.component.html'
})
export class AdministrationStyleGuideComponent {}
