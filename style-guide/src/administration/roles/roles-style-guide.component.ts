import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyRolesComponent, BeyRolesConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyRolesComponent, TranslateModule],
    selector: 'bey-roles-style-guide',
    standalone: true,
    styleUrls: ['../../style-guide-shared.css'],
    templateUrl: './roles-style-guide.component.html'
})
export class RolesStyleGuideComponent {
    readonly config = new BeyRolesConfig({
        baseUrl: '/style-guide/roles',
        height: '24rem',
        storageKey: 'style-guide-roles',
        usersUrl: '/style-guide/users'
    });
}
