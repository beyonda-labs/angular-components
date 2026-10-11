import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyGroupsComponent, BeyGroupsConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyGroupsComponent, TranslateModule],
    selector: 'bey-groups-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './groups-style-guide.component.html'
})
export class GroupsStyleGuideComponent {
    readonly config = new BeyGroupsConfig({
        baseUrl: '/style-guide/groups',
        height: '24rem',
        storageKey: 'style-guide-groups',
        usersUrl: '/style-guide/users'
    });
}
