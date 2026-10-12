import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { PageHandle } from '../../page/models/page.model';
import { PageComponent } from '../../page/page.component';
import { UserOrganizationsService } from '../services/user-organizations.service';
import { buildGroupsPageConfig } from './groups-page-config';
import { GroupRow, GroupsConfig } from './models/groups.model';
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

        return buildGroupsPageConfig({
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
                    onEdit: edited => this.groupsActionsService.edit(config, edited, isSuperadmin, this.page)
                }),
            onEdit: group => this.groupsActionsService.edit(config, group, isSuperadmin, this.page),
            onReady: handle => (this.page = handle),
            organizations
        });
    });

    private page?: PageHandle<GroupRow>;

    constructor() {
        effect(() => {
            const { usersUrl } = this.config();

            untracked(() => this.userOrganizationsService.load(usersUrl));
        });
    }
}
