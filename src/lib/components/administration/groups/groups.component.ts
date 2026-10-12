import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { buildOrganizationFoldersConfig } from '../functions/organization-folders';
import { OrganizationFolder } from '../models/organization-folders.model';
import { OrganizationFolderTableService } from '../services/organization-folder-table.service';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { groupsPageMode } from './functions/groups-page-mode';
import { buildGroupsPageConfig } from './groups-page-config';
import { GroupRow, GroupsConfig, GroupsPageMode } from './models/groups.model';
import { GroupsActionsService } from './services/groups-actions.service';
import { GroupsFormService } from './services/groups-form.service';
import { GroupsTableService } from './services/groups-table.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent],
    providers: [UserOrganizationsService],
    selector: 'bey-groups',
    standalone: true,
    styleUrls: ['./groups.component.css'],
    templateUrl: './groups.component.html'
})
export class GroupsComponent {
    private readonly groupsActionsService = inject(GroupsActionsService);
    private readonly groupsFormService = inject(GroupsFormService);
    private readonly groupsTableService = inject(GroupsTableService);
    private readonly organizationFolderTableService = inject(OrganizationFolderTableService);
    private readonly userOrganizationsService = inject(UserOrganizationsService);

    readonly config = input.required<GroupsConfig>();

    readonly pageConfig = computed(() => {
        const config = this.config();
        const isSuperadmin = this.userOrganizationsService.isSuperadmin();
        const organizations = this.userOrganizationsService.organizations();
        const mode = this.mode();
        const { prefix } = config;
        const onView = (group: GroupRow): void => this.groupsActionsService.view(config, group);

        if (!organizations) {
            return null;
        }

        return buildGroupsPageConfig({
            categoriesConfig: isSuperadmin
                ? buildOrganizationFoldersConfig(folder =>
                      this.organizationFolderTableService.loadRow(folder, {
                          onOpen: opened => this.page?.openCategory(opened)
                      })
                  )
                : undefined,
            config,
            formConfig: this.groupsFormService.buildFormConfig({
                isOrganizationAsked: isSuperadmin,
                organizations,
                prefix
            }),
            isOrganizationShown: isSuperadmin,
            loadRow: group =>
                this.groupsTableService.loadRow(group, {
                    isOrganizationShown: isSuperadmin,
                    mode,
                    onEdit: edited => this.groupsActionsService.edit(config, edited, isSuperadmin, this.page),
                    onView,
                    prefix
                }),
            mode,
            onDataLoaded: response => this.mode.update(current => groupsPageMode(current, response)),
            onEdit: group => this.groupsActionsService.edit(config, group, isSuperadmin, this.page),
            onReady: handle => (this.page = handle),
            onView,
            organizations
        });
    });

    private readonly mode = signal(GroupsPageMode.Manage);
    private page?: PageHandle<GroupRow, OrganizationFolder>;

    constructor() {
        effect(() => {
            const { usersUrl } = this.config();

            untracked(() => this.userOrganizationsService.load(usersUrl));
        });
    }
}
