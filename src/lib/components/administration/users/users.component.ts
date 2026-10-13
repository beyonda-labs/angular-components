import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { buildOrganizationFoldersConfig } from '../functions/organization-folders';
import { OrganizationFolder } from '../models/organization-folders.model';
import { OrganizationFolderTableService } from '../services/organization-folder-table.service';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { isOrganizationColumnShown } from './functions/user-organizations';
import { UserRow, UsersConfig } from './models/users.model';
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
    private readonly organizationFolderTableService = inject(OrganizationFolderTableService);
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
            categoriesConfig: isSuperadmin
                ? buildOrganizationFoldersConfig(folder =>
                      this.organizationFolderTableService.loadRow(folder, {
                          onOpen: opened => this.page?.openCategory(opened)
                      })
                  )
                : undefined,
            config,
            formConfig: this.usersFormService.buildFormConfig({
                extraRoles: roles.extraRoles,
                isOrganizationAsked: isSuperadmin,
                organizations,
                prefix,
                rolePrefix,
                roles: roles.roles
            }),
            isOrganizationShown,
            loadRow: user =>
                this.usersTableService.loadRow(user, {
                    isOrganizationShown,
                    onEdit: edited => this.page?.openEdit(edited),
                    prefix,
                    rolePrefix
                }),
            onDelete: users => this.usersActionsService.delete(config, users, this.page),
            onReady: handle => (this.page = handle),
            onResendInvitation: user => this.usersActionsService.resendInvitation(config, user),
            onTransfer: user => this.usersActionsService.transfer(config, user, this.page),
            organizations,
            roleOptions: this.usersFormService.buildRoleFilterOptions(roles, rolePrefix, organizations)
        });
    });

    private page?: PageHandle<UserRow, OrganizationFolder>;

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
