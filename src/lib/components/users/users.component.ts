import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { PageHandle } from '../page/models/page.model';
import { PageComponent } from '../page/page.component';
import { UserRow, UsersConfig } from './models/users.model';
import { UserRolesService } from './services/user-roles.service';
import { UsersActionsService } from './services/users-actions.service';
import { UsersFormService } from './services/users-form.service';
import { UsersTableService } from './services/users-table.service';
import { buildUsersPageConfig } from './users-page-config';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    providers: [UserRolesService],
    selector: 'bey-users',
    standalone: true,
    styleUrls: ['./users.component.css'],
    templateUrl: './users.component.html'
})
export class UsersComponent {
    private readonly userRolesService = inject(UserRolesService);
    private readonly usersActionsService = inject(UsersActionsService);
    private readonly usersFormService = inject(UsersFormService);
    private readonly usersTableService = inject(UsersTableService);

    readonly config = input.required<UsersConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const roles = this.userRolesService.roles();
        const { prefix, rolePrefix } = config;

        return roles
            ? buildUsersPageConfig({
                  config,
                  formConfig: this.usersFormService.buildFormConfig({ prefix, rolePrefix, roles }),
                  loadRow: user =>
                      this.usersTableService.loadRow(user, {
                          onEdit: edited => this.page?.openEdit(edited),
                          prefix,
                          rolePrefix
                      }),
                  onReady: handle => (this.page = handle),
                  onResendInvitation: user => this.usersActionsService.resendInvitation(config, user),
                  roleOptions: this.usersFormService.buildRoleOptions(roles, rolePrefix)
              })
            : null;
    });

    private page?: PageHandle<UserRow>;

    constructor() {
        effect(() => {
            const { baseUrl } = this.config();

            untracked(() => this.userRolesService.load(baseUrl));
        });
    }
}
