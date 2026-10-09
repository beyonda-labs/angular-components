import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyUsersComponent, BeyUsersConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyUsersComponent, TranslateModule],
    selector: 'bey-users-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './users-style-guide.component.html'
})
export class UsersStyleGuideComponent {
    readonly config = new BeyUsersConfig({
        baseUrl: '/style-guide/users',
        height: '24rem',
        rolePrefix: 'angular-components-style-guide.users.roles',
        storageKey: 'style-guide-users'
    });
}
