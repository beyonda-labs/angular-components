import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { OrganizationFolder } from '../models/organization-folders.model';
import { OrganizationFolderTableService } from '../services/organization-folder-table.service';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { rolesPageMode } from './functions/roles-page-mode';
import { RoleRow, RolesConfig, RolesFormOptions, RolesPageMode } from './models/roles.model';
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
    private readonly organizationFolderTableService = inject(OrganizationFolderTableService);
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
        const { actionOrder, baseUrl, groupIcons, groupOrder, permissionPrefix, prefix, rolePrefix } = config;

        if (!organizations || !permissions) {
            return null;
        }

        const formOptions: RolesFormOptions = {
            actionOrder,
            groupIcons,
            groupOrder,
            isOrganizationAsked: isSuperadmin,
            organizations,
            permissionPrefix,
            permissions,
            prefix
        };
        const onView = (role: RoleRow): void =>
            this.rolesActionsService.viewPermissions(
                { actionOrder, groupIcons, groupOrder, permissionPrefix, permissions, prefix, rolePrefix },
                role
            );

        return buildRolesPageConfig({
            categoriesConfig: this.organizationFolderTableService.buildFoldersConfig({
                isShown: isSuperadmin,
                onOpen: folder => this.page?.openCategory(folder),
                prefix
            }),
            config,
            formConfig: this.rolesFormService.buildFormConfig(formOptions),
            isOrganizationShown: isSuperadmin,
            loadRow: role =>
                this.rolesTableService.loadRow(role, {
                    isOrganizationShown: isSuperadmin,
                    onEdit: edited => this.page?.openEdit(edited),
                    onView,
                    prefix,
                    rolePrefix
                }),
            mode: this.mode.asReadonly(),
            onDataLoaded: ({ results }) => this.mode.update(current => rolesPageMode(current, results)),
            onDuplicate: role =>
                this.rolesActionsService.duplicate({ ...formOptions, baseUrl, rolePrefix }, role, this.page),
            onReady: handle => (this.page = handle),
            onView,
            organizations
        });
    });

    private readonly mode = signal(RolesPageMode.Manage);
    private page?: PageHandle<RoleRow, OrganizationFolder>;

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
