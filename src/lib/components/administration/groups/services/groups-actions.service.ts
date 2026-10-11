import { inject, Injectable } from '@angular/core';

import { PageHandle } from '../../../page/models/page.model';
import { GroupEditFields, GroupRow, GroupsConfig } from '../models/groups.model';
import { GroupsFormService } from './groups-form.service';
import { GroupsHttpService } from './groups-http.service';

@Injectable({
    providedIn: 'root'
})
export class GroupsActionsService {
    private readonly groupsFormService = inject(GroupsFormService);
    private readonly groupsHttpService = inject(GroupsHttpService);

    edit({ baseUrl, prefix }: GroupsConfig, group: GroupRow, page?: PageHandle<GroupRow>): void {
        if (!page) {
            return;
        }

        this.groupsHttpService.loadGroup(baseUrl, group.id).subscribe(detail =>
            page.openForm(
                this.groupsFormService.buildEditFormConfig({
                    detail,
                    prefix,
                    searchExtraRoles: (search, limit) =>
                        this.groupsHttpService.searchExtraRoles(baseUrl, group.id, search, limit),
                    searchMembers: (search, limit) =>
                        this.groupsHttpService.searchMembers(baseUrl, group.id, search, limit)
                }),
                ({ main }) =>
                    this.groupsHttpService.edit(baseUrl, group.id, toEditRequest(main), `${prefix}.toast.edit-success`)
            )
        );
    }
}

function toEditRequest({ extraRoleIds, name, userIds }: GroupEditFields): GroupEditFields {
    return { extraRoleIds, name: name.trim(), userIds };
}
