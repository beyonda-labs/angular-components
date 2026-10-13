import { inject, Injectable } from '@angular/core';

import { ModalFormService } from '../../../form/components/modal/services/modal-form.service';
import { PageHandle } from '../../../page/models/page.model';
import { OrganizationFolder } from '../../models/organization-folders.model';
import { RoleViewSettings } from '../../models/role-permissions.model';
import { RoleViewFormService } from '../../services/role-view-form.service';
import { GroupEditFields, GroupEditFormFields, GroupRow, GroupsConfig, GroupViewRole } from '../models/groups.model';
import { GroupsFormService } from './groups-form.service';
import { GroupsHttpService } from './groups-http.service';

@Injectable({
    providedIn: 'root'
})
export class GroupsActionsService {
    private readonly groupsFormService = inject(GroupsFormService);
    private readonly groupsHttpService = inject(GroupsHttpService);
    private readonly modalFormService = inject(ModalFormService);
    private readonly roleViewFormService = inject(RoleViewFormService);

    edit(
        { baseUrl, prefix }: GroupsConfig,
        group: GroupRow,
        isOrganizationShown: boolean,
        page?: PageHandle<GroupRow, OrganizationFolder>
    ): void {
        if (!page) {
            return;
        }

        this.groupsHttpService.loadGroup(baseUrl, group.id).subscribe(detail =>
            page.openForm(
                this.groupsFormService.buildEditFormConfig({
                    detail,
                    isOrganizationShown,
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

    view({ baseUrl, prefix, rolesConfig }: GroupsConfig, group: GroupRow): void {
        this.groupsHttpService.loadGroupView(baseUrl, group.id).subscribe(view =>
            this.modalFormService.open(
                this.groupsFormService.buildViewConfig({
                    group: view,
                    onRoleClick: role => this.viewRole(rolesConfig, role),
                    prefix
                })
            )
        );
    }

    private viewRole(rolesConfig: RoleViewSettings, role: GroupViewRole): void {
        this.modalFormService.open(
            this.roleViewFormService.buildViewConfig({ ...rolesConfig, permissions: [] }, { ...role, isBase: false })
        );
    }
}

function toEditRequest({ extraRoleIds, name, userIds }: GroupEditFormFields): GroupEditFields {
    return { extraRoleIds, name: name.trim(), userIds };
}
