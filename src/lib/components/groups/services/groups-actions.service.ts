import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { PageHandle } from '../../page/models/page.model';
import { GroupRow, GroupsConfig } from '../models/groups.model';
import { GroupsFormService } from './groups-form.service';
import { GroupsHttpService } from './groups-http.service';

@Injectable({
    providedIn: 'root'
})
export class GroupsActionsService {
    private readonly groupsFormService = inject(GroupsFormService);
    private readonly groupsHttpService = inject(GroupsHttpService);

    editMembers({ baseUrl, prefix }: GroupsConfig, group: GroupRow, page?: PageHandle<GroupRow>): void {
        if (!page) {
            return;
        }

        forkJoin([
            this.groupsHttpService.loadMemberOptions(baseUrl, group.id),
            this.groupsHttpService.loadMembers(baseUrl, group.id)
        ]).subscribe(([options, members]) =>
            page.openForm(this.groupsFormService.buildMembersFormConfig(prefix, group, options, members), ({ main }) =>
                this.groupsHttpService.setMembers(baseUrl, group.id, main.userIds, `${prefix}.toast.members-success`)
            )
        );
    }
}
