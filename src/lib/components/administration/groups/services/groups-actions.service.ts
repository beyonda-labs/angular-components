import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

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

        forkJoin([
            this.groupsHttpService.loadGroup(baseUrl, group.id),
            this.groupsHttpService.loadMemberOptions(baseUrl, group.id),
            this.groupsHttpService.loadRoleOptions(baseUrl, group.id)
        ]).subscribe(([detail, memberOptions, roleOptions]) =>
            page.openForm(
                this.groupsFormService.buildEditFormConfig({ detail, memberOptions, prefix, roleOptions }),
                ({ main }) =>
                    this.groupsHttpService.edit(baseUrl, group.id, toEditRequest(main), `${prefix}.toast.edit-success`)
            )
        );
    }
}

function toEditRequest({ extraRoleIds, name, userIds }: GroupEditFields): GroupEditFields {
    return { name: name.trim(), userIds, ...(extraRoleIds ? { extraRoleIds } : {}) };
}
