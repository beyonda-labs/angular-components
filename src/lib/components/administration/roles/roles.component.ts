import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { hasOrganizationChoice } from '../../page/functions/page-organization-filter';
import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { RoleRow, RolesConfig } from './models/roles.model';
import { buildRolesPageConfig } from './roles-page-config';
import { RolePermissionsService } from './services/role-permissions.service';
import { RolesActionsService } from './services/roles-actions.service';
import { RolesFormService } from './services/roles-form.service';
import { RolesTableService } from './services/roles-table.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    providers: [RolePermissionsService, UserOrganizationsService],
    selector: 'bey-roles',
    standalone: true,
    styleUrls: ['./roles.component.css'],
    templateUrl: './roles.component.html'
})
export class RolesComponent {
    private readonly rolePermissionsService = inject(RolePermissionsService);
    private readonly rolesActionsService = inject(RolesActionsService);
    private readonly rolesFormService = inject(RolesFormService);
    private readonly rolesTableService = inject(RolesTableService);
    private readonly userOrganizationsService = inject(UserOrganizationsService);

    readonly config = input.required<RolesConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const isSuperadmin = this.userOrganizationsService.isSuperadmin();
        const organizations = this.userOrganizationsService.organizations();
        const permissions = this.rolePermissionsService.permissions();
        const { actionOrder, groupIcons, groupOrder, permissionPrefix, prefix, rolePrefix } = config;

        if (!organizations || !permissions) {
            return null;
        }

        const isOrganizationShown = isSuperadmin && hasOrganizationChoice(organizations);

        return buildRolesPageConfig({
            config,
            formConfig: this.rolesFormService.buildFormConfig({
                actionOrder,
                groupIcons,
                groupOrder,
                isOrganizationAsked: isSuperadmin,
                organizations,
                permissionPrefix,
                permissions,
                prefix
            }),
            isOrganizationShown,
            loadRow: role =>
                this.rolesTableService.loadRow(role, {
                    isOrganizationShown,
                    onEdit: edited => this.page?.openEdit(edited),
                    onView: viewed =>
                        this.rolesActionsService.viewPermissions(
                            { actionOrder, groupIcons, groupOrder, permissionPrefix, permissions, prefix, rolePrefix },
                            viewed
                        ),
                    prefix,
                    rolePrefix
                }),
            onReady: handle => (this.page = handle),
            organizations
        });
    });

    private page?: PageHandle<RoleRow>;

    constructor() {
        effect(() => {
            const { baseUrl, usersUrl } = this.config();

            untracked(() => {
                this.userOrganizationsService.load(usersUrl);
                this.rolePermissionsService.load(baseUrl);
            });
        });
    }
}
