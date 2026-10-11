import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { PageHandle } from '../page/models/page.model';
import { PageComponent } from '../page/page.component';
import { isOrganizationColumnShown } from './functions/user-organizations';
import { UserRow, UsersConfig } from './models/users.model';
import { UserOrganizationsService } from './services/user-organizations.service';
import { UserRolesService } from './services/user-roles.service';
import { UsersActionsService } from './services/users-actions.service';
import { UsersFormService } from './services/users-form.service';
import { UsersTableService } from './services/users-table.service';
import { buildUsersPageConfig } from './users-page-config';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    providers: [UserOrganizationsService, UserRolesService],
    selector: 'bey-users',
    standalone: true,
    styleUrls: ['./users.component.css'],
    templateUrl: './users.component.html'
})
export class UsersComponent {
    private readonly userOrganizationsService = inject(UserOrganizationsService);
    private readonly userRolesService = inject(UserRolesService);
    private readonly usersActionsService = inject(UsersActionsService);
    private readonly usersFormService = inject(UsersFormService);
    private readonly usersTableService = inject(UsersTableService);

    readonly config = input.required<UsersConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const isSuperadmin = this.userOrganizationsService.isSuperadmin();
        const organizations = this.userOrganizationsService.organizations();
        const roles = this.userRolesService.roles();
        const { prefix, rolePrefix } = config;

        if (!roles || !organizations) {
            return null;
        }

        const isOrganizationShown = isOrganizationColumnShown(organizations, isSuperadmin);

        return buildUsersPageConfig({
            config,
            formConfig: this.usersFormService.buildFormConfig({
                isOrganizationAsked: isSuperadmin,
                organizations,
                prefix,
                rolePrefix,
                roles
            }),
            isOrganizationShown,
            loadRow: user =>
                this.usersTableService.loadRow(user, {
                    isOrganizationShown,
                    onEdit: edited => this.page?.openEdit(edited),
                    prefix,
                    rolePrefix
                }),
            onReady: handle => (this.page = handle),
            onResendInvitation: user => this.usersActionsService.resendInvitation(config, user),
            organizations,
            roleOptions: this.usersFormService.buildRoleOptions(roles, rolePrefix)
        });
    });

    private page?: PageHandle<UserRow>;

    constructor() {
        effect(() => {
            const { baseUrl } = this.config();

            untracked(() => {
                this.userOrganizationsService.load(baseUrl);
                this.userRolesService.load(baseUrl);
            });
        });
    }
}
