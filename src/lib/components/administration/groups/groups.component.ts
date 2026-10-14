import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
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
        const { prefix } = config;

        if (!organizations) {
            return null;
        }

        const onEdit = (group: GroupRow): void =>
            this.groupsActionsService.edit(config, group, isSuperadmin, this.page);
        const onView = (group: GroupRow): void => this.groupsActionsService.view(config, group);

        return buildGroupsPageConfig({
            categoriesConfig: this.organizationFolderTableService.buildFoldersConfig({
                isShown: isSuperadmin,
                onOpen: folder => this.page?.openCategory(folder),
                prefix
            }),
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
                    mode: this.mode(),
                    onEdit,
                    onView,
                    prefix
                }),
            mode: this.mode.asReadonly(),
            onDataLoaded: response => this.mode.update(current => groupsPageMode(current, response)),
            onEdit,
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
